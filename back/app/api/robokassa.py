from fastapi import APIRouter, Depends, HTTPException, Request, Body
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import os
from typing import Optional
from robokassa import Robokassa, HashAlgorithm
from pydantic import BaseModel
import logging
import hashlib

from app.database import get_db
from app.models import Order as OrderModel

router = APIRouter()
logger = logging.getLogger(__name__)

class PaymentLinkRequest(BaseModel):
    order_id: int
ROBOKASSA_MERCHANT_LOGIN = os.getenv("ROBOKASSA_MERCHANT_LOGIN", "")
ROBOKASSA_PASSWORD1 = os.getenv("ROBOKASSA_PASSWORD1", "")
ROBOKASSA_PASSWORD2 = os.getenv("ROBOKASSA_PASSWORD2", "")
ROBOKASSA_IS_TEST = os.getenv("ROBOKASSA_IS_TEST", "True").lower() == "true"
ROBOKASSA_ALGORITHM = "md5"
ALGORITHM_MAP = {
    "md5": HashAlgorithm.md5,
    "ripemd160": HashAlgorithm.ripemd160,
    "sha1": HashAlgorithm.sha1,
    "sha256": HashAlgorithm.sha256,
    "sha384": HashAlgorithm.sha384,
    "sha512": HashAlgorithm.sha512,
}
robokassa_client = Robokassa(
    merchant_login=ROBOKASSA_MERCHANT_LOGIN,
    password1=ROBOKASSA_PASSWORD1,
    password2=ROBOKASSA_PASSWORD2,
    is_test=ROBOKASSA_IS_TEST,
    algorithm=ALGORITHM_MAP.get(ROBOKASSA_ALGORITHM, HashAlgorithm.md5),
)

def calculate_result_signature_manually(out_sum, inv_id, password2, additional_params=None, algorithm="md5", original_out_sum_str=None):
    if original_out_sum_str:
        out_sum_str = original_out_sum_str
    else:
        out_sum_str = str(out_sum)
    parts = [out_sum_str, str(inv_id), password2]
    if additional_params:
        sorted_params = sorted(additional_params.items())
        for key, value in sorted_params:
            parts.append(f"{key}={value}")
    
    hash_string = ":".join(parts)
    if algorithm.lower() == "md5":
        hash_value = hashlib.md5(hash_string.encode('utf-8')).hexdigest().upper()
    elif algorithm.lower() == "sha512":
        hash_value = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().upper()
    elif algorithm.lower() == "sha256":
        hash_value = hashlib.sha256(hash_string.encode('utf-8')).hexdigest().upper()
    elif algorithm.lower() == "sha1":
        hash_value = hashlib.sha1(hash_string.encode('utf-8')).hexdigest().upper()
    else:
        hash_value = hashlib.md5(hash_string.encode('utf-8')).hexdigest().upper()
    
    return hash_string, hash_value

def calculate_redirect_signature_manually(out_sum, inv_id, password1, additional_params=None, algorithm="md5", original_out_sum_str=None):
    if original_out_sum_str:
        out_sum_str = original_out_sum_str
    else:
        out_sum_str = str(out_sum)
    parts = [out_sum_str, str(inv_id), password1]
    if additional_params:
        sorted_params = sorted(additional_params.items())
        for key, value in sorted_params:
            parts.append(f"{key}={value}")
    
    hash_string = ":".join(parts)
    if algorithm.lower() == "md5":
        hash_value = hashlib.md5(hash_string.encode('utf-8')).hexdigest().upper()
    elif algorithm.lower() == "sha512":
        hash_value = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().upper()
    elif algorithm.lower() == "sha256":
        hash_value = hashlib.sha256(hash_string.encode('utf-8')).hexdigest().upper()
    elif algorithm.lower() == "sha1":
        hash_value = hashlib.sha1(hash_string.encode('utf-8')).hexdigest().upper()
    else:
        hash_value = hashlib.md5(hash_string.encode('utf-8')).hexdigest().upper()
    
    return hash_string, hash_value

@router.post("/generate-payment-link")
async def generate_payment_link(
    request_data: PaymentLinkRequest,
    db: Session = Depends(get_db)
):
    order = db.query(OrderModel).filter(OrderModel.id == request_data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "completed":
        raise HTTPException(status_code=400, detail="Order already completed")
    
    try:
        response = robokassa_client.generate_open_payment_link(
            out_sum=order.final_price,
            inv_id=order.id,
            description=f"Оплата заказа #{order.id}: {order.product_name}",
            email=order.email if order.email else None,
            order_id=order.id,
            username=order.username,
            product_type=order.product_type,
            product_id=order.product_id,
        )
        
        return {
            "payment_url": response.url,
            "order_id": order.id,
            "amount": order.final_price,
        }
    except Exception as e:
        logger.error(f"Failed to generate payment link: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate payment link: {str(e)}")


@router.post("/result")
async def robokassa_result(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        form_data = await request.form()
        original_out_sum_str = form_data.get("OutSum", "0")
        out_sum = float(original_out_sum_str)
        inv_id = int(form_data.get("InvId", 0))
        signature = form_data.get("SignatureValue", "")
        additional_params = {
            key: value
            for key, value in form_data.items()
            if key.startswith("shp_")
        }
        sorted_additional_params = dict(sorted(additional_params.items()))
        hash_string_md5, calculated_md5 = calculate_result_signature_manually(
            out_sum, inv_id, ROBOKASSA_PASSWORD2, sorted_additional_params, "md5", original_out_sum_str
        )
        hash_string_sha512, calculated_sha512 = calculate_result_signature_manually(
            out_sum, inv_id, ROBOKASSA_PASSWORD2, sorted_additional_params, "sha512", original_out_sum_str
        )
        try:
            is_valid = robokassa_client.is_result_notification_valid(
                signature=signature,
                out_sum=out_sum,
                inv_id=inv_id,
                **sorted_additional_params
            )
            if not is_valid:
                if calculated_md5.upper() == signature.upper() or calculated_sha512.upper() == signature.upper():
                    is_valid = True
        except Exception as e:
            logger.error(f"Error during signature validation: {str(e)}", exc_info=True)
            if (calculated_md5.upper() == signature.upper() or calculated_sha512.upper() == signature.upper()):
                is_valid = True
            else:
                is_valid = False
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid signature")
        order = db.query(OrderModel).filter(OrderModel.id == inv_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if abs(order.final_price - out_sum) > 0.01:
            raise HTTPException(
                status_code=400,
                detail=f"Amount mismatch: expected {order.final_price}, got {out_sum}"
            )
        order.status = "completed"
        db.commit()
        return f"OK{inv_id}"
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception in /result: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing payment: {str(e)}")


@router.get("/success")
async def robokassa_success(
    request: Request,
    db: Session = Depends(get_db)
):
    original_out_sum_str = request.query_params.get("OutSum")
    out_sum = request.query_params.get("OutSum")
    inv_id = request.query_params.get("InvId")
    signature = request.query_params.get("SignatureValue")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    if not all([out_sum, inv_id, signature]):
        return RedirectResponse(
            url=f"{frontend_url}/robokassa/fail?InvId={inv_id or 'N/A'}"
        )
    
    try:
        out_sum_float = float(out_sum)
        inv_id = int(inv_id)
        additional_params = {
            key: value
            for key, value in request.query_params.items()
            if key.startswith("shp_")
        }
        order = db.query(OrderModel).filter(OrderModel.id == inv_id).first()
        if not order:
            return RedirectResponse(
                url=f"{frontend_url}/robokassa/fail?InvId={inv_id}"
            )
        if order.status == "completed":
            is_valid = True
        else:
            try:
                is_valid = robokassa_client.is_redirect_valid(
                    signature=signature,
                    out_sum=out_sum_float,
                    inv_id=inv_id,
                    **additional_params
                )
            except Exception as e:
                logger.error(f"Error during signature validation: {str(e)}", exc_info=True)
                is_valid = False
        
        if not is_valid:
            return RedirectResponse(
                url=f"{frontend_url}/robokassa/fail?InvId={inv_id}"
            )
        from urllib.parse import urlencode
        redirect_params = {
            "InvId": inv_id,
            "OutSum": original_out_sum_str, 
            "SignatureValue": signature
        }
        redirect_params.update(additional_params)
        for key, value in request.query_params.items():
            if key not in ["InvId", "OutSum", "SignatureValue"] and not key.startswith("shp_"):
                redirect_params[key] = value
        
        query_string = urlencode(redirect_params)
        redirect_url = f"{frontend_url}/robokassa/success?{query_string}"
        
        return RedirectResponse(url=redirect_url)
        
    except Exception as e:
        logger.error(f"Exception in /success: {str(e)}", exc_info=True)
        return RedirectResponse(
            url=f"{frontend_url}/robokassa/fail?InvId={inv_id if 'inv_id' in locals() else 'N/A'}"
        )


@router.get("/verify-success")
async def verify_success(
    request: Request,
    db: Session = Depends(get_db)
):
    original_out_sum_str = request.query_params.get("OutSum")
    out_sum = request.query_params.get("OutSum")
    inv_id = request.query_params.get("InvId")
    signature = request.query_params.get("SignatureValue")
    
    if not all([out_sum, inv_id, signature]):
        return {
            "success": False,
            "message": "Отсутствуют необходимые параметры"
        }
    
    try:
        out_sum = float(out_sum)
        inv_id = int(inv_id)
        additional_params = {
            key: value
            for key, value in request.query_params.items()
            if key.startswith("shp_")
        }
        sorted_additional_params = dict(sorted(additional_params.items()))
        hash_string_md5, calculated_md5 = calculate_redirect_signature_manually(
            out_sum, inv_id, ROBOKASSA_PASSWORD1, sorted_additional_params, "md5", original_out_sum_str
        )
        hash_string_sha512, calculated_sha512 = calculate_redirect_signature_manually(
            out_sum, inv_id, ROBOKASSA_PASSWORD1, sorted_additional_params, "sha512", original_out_sum_str
        )
        try:
            is_valid = robokassa_client.is_redirect_valid(
                signature=signature,
                out_sum=out_sum,
                inv_id=inv_id,
                **sorted_additional_params
            )
            if not is_valid:
                if calculated_md5.upper() == signature.upper() or calculated_sha512.upper() == signature.upper():
                    is_valid = True
        except Exception as e:
            logger.error(f"Error during signature validation: {str(e)}", exc_info=True)
            if (calculated_md5.upper() == signature.upper() or calculated_sha512.upper() == signature.upper()):
                is_valid = True
            else:
                is_valid = False
        
        if not is_valid:
            return {
                "success": False,
                "message": "Ошибка проверки подписи"
            }
        order = db.query(OrderModel).filter(OrderModel.id == inv_id).first()
        if not order:
            return {
                "success": False,
                "message": "Заказ не найден"
            }
        
        return {
            "success": True,
            "message": "Оплата прошла успешно!",
            "order_id": order.id,
            "product_name": order.product_name,
            "amount": order.final_price
        }
        
    except Exception as e:
        logger.error(f"Error verifying success: {str(e)}", exc_info=True)
        return {
            "success": False,
            "message": f"Ошибка обработки: {str(e)}"
        }


@router.get("/fail")
async def robokassa_fail(
    request: Request
):
    inv_id = request.query_params.get("InvId", "N/A")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    redirect_url = f"{frontend_url}/robokassa/fail?InvId={inv_id}"
    return RedirectResponse(url=redirect_url)

