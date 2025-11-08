package ru.kseonyt.plasmixgave.model;

import com.google.gson.annotations.SerializedName;

public class Order {
    private int id;
    
    @SerializedName("product_type")
    private String productType;
    
    @SerializedName("product_id")
    private int productId;
    
    @SerializedName("product_name")
    private String productName;
    
    @SerializedName("username")
    private String nickname;
    private String email;
    private int quantity;
    private String duration;
    
    @SerializedName("promo_code")
    private String promoCode;
    
    @SerializedName("discount_amount")
    private double discountAmount;
    
    @SerializedName("cashback_amount")
    private int cashbackAmount;
    
    @SerializedName("cashback_percent")
    private int cashbackPercent;
    
    @SerializedName("cashback_command")
    private String cashbackCommand;
    
    @SerializedName("payment_method")
    private String paymentMethod;
    
    private String status;
    private String mode;
    private String command;
    
    @SerializedName("test_mode")
    private boolean testMode;
    
    @SerializedName("final_price")
    private double finalPrice;
    
    @SerializedName("created_at")
    private String createdAt;
    
    @SerializedName("updated_at")
    private String updatedAt;
    public int getId() { return id; }
    public String getProductType() { return productType; }
    public int getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getNickname() { return nickname; }
    public String getEmail() { return email; }
    public int getQuantity() { return quantity; }
    public String getDuration() { return duration; }
    public String getPromoCode() { return promoCode; }
    public double getDiscountAmount() { return discountAmount; }
    public int getCashbackAmount() { return cashbackAmount; }
    public int getCashbackPercent() { return cashbackPercent; }
    public String getCashbackCommand() { return cashbackCommand; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getStatus() { return status; }
    public String getMode() { return mode; }
    public String getCommand() { return command; }
    public boolean isTestMode() { return testMode; }
    public double getFinalPrice() { return finalPrice; }
    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setStatus(String status) { this.status = status; }
}

