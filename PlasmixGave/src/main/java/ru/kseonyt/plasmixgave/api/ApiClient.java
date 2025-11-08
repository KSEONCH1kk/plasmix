package ru.kseonyt.plasmixgave.api;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import ru.kseonyt.plasmixgave.PlasmixGave;
import ru.kseonyt.plasmixgave.model.Order;
import ru.kseonyt.plasmixgave.model.OrderResponse;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class ApiClient {
    private final PlasmixGave plugin;
    private final Gson gson;
    private final String apiUrl;
    private final String secretKey;

    public ApiClient(PlasmixGave plugin) {
        this.plugin = plugin;
        this.gson = new GsonBuilder().create();
        this.apiUrl = plugin.getConfig().getString("api.url");
        this.secretKey = plugin.getConfig().getString("api.secret-key");
    }

    /**
     * Получить список необработанных заказов для этого сервера
     */
    public List<Order> getPendingOrders() {
        try {
            String serverMode = plugin.getConfig().getString("server.mode");
            String endpoint = apiUrl + "/orders?mode=" + serverMode + "&status=pending";
            
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                plugin.getLogger().info("Fetching orders from: " + endpoint);
            }
            
            String response = sendGetRequest(endpoint);
            
            if (response == null || response.isEmpty()) {
                return new ArrayList<>();
            }
            
            OrderResponse orderResponse = gson.fromJson(response, OrderResponse.class);
            
            if (orderResponse != null && orderResponse.getOrders() != null) {
                return orderResponse.getOrders();
            }
            
            return new ArrayList<>();
            
        } catch (Exception e) {
            plugin.getLogger().severe("Error fetching pending orders: " + e.getMessage());
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                e.printStackTrace();
            }
            return new ArrayList<>();
        }
    }

    /**
     * Обновить статус заказа
     */
    public boolean updateOrderStatus(int orderId, String status) {
        try {
            String endpoint = apiUrl + "/orders/" + orderId;
            String jsonData = "{\"status\":\"" + status + "\"}";
            
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                plugin.getLogger().info("Updating order " + orderId + " to status: " + status);
            }
            
            String response = sendPatchRequest(endpoint, jsonData);
            return response != null;
            
        } catch (Exception e) {
            plugin.getLogger().severe("Error updating order status: " + e.getMessage());
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                e.printStackTrace();
            }
            return false;
        }
    }

    /**
     * Отметить заказ как выданный
     */
    public boolean markOrderAsDelivered(int orderId) {
        try {
            String endpoint = apiUrl + "/orders/" + orderId;
            String jsonData = "{\"delivered\":true}";
            
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                plugin.getLogger().info("Marking order " + orderId + " as delivered");
            }
            
            String response = sendPatchRequest(endpoint, jsonData);
            return response != null;
            
        } catch (Exception e) {
            plugin.getLogger().severe("Error marking order as delivered: " + e.getMessage());
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                e.printStackTrace();
            }
            return false;
        }
    }

    /**
     * Отправить GET запрос
     */
    private String sendGetRequest(String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("X-API-Key", secretKey);
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        
        int responseCode = conn.getResponseCode();
        
        if (responseCode == HttpURLConnection.HTTP_OK) {
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder response = new StringBuilder();
            String line;
            
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();
            
            return response.toString();
        } else {
            plugin.getLogger().warning("GET request failed with code: " + responseCode);
            return null;
        }
    }

    /**
     * Отправить PATCH запрос (используем PUT как workaround)
     */
    private String sendPatchRequest(String urlString, String jsonData) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("PUT");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("X-API-Key", secretKey);
        conn.setDoOutput(true);
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonData.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        
        int responseCode = conn.getResponseCode();
        
        if (responseCode == HttpURLConnection.HTTP_OK) {
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder response = new StringBuilder();
            String line;
            
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();
            
            return response.toString();
        } else {
            plugin.getLogger().warning("PUT request failed with code: " + responseCode);
            return null;
        }
    }
}

