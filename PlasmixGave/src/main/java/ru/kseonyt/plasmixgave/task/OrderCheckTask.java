package ru.kseonyt.plasmixgave.task;

import org.bukkit.scheduler.BukkitRunnable;
import ru.kseonyt.plasmixgave.PlasmixGave;
import ru.kseonyt.plasmixgave.api.ApiClient;
import ru.kseonyt.plasmixgave.handler.OrderHandler;
import ru.kseonyt.plasmixgave.model.Order;

import java.util.List;

public class OrderCheckTask extends BukkitRunnable {
    private final PlasmixGave plugin;
    private final ApiClient apiClient;
    private final OrderHandler orderHandler;

    public OrderCheckTask(PlasmixGave plugin, ApiClient apiClient, OrderHandler orderHandler) {
        this.plugin = plugin;
        this.apiClient = apiClient;
        this.orderHandler = orderHandler;
    }

    @Override
    public void run() {
        try {
            List<Order> orders = apiClient.getPendingOrders();
            
            if (orders.isEmpty()) {
                if (plugin.getConfig().getBoolean("debug.enabled")) {
                    plugin.getLogger().info("No pending orders found");
                }
                return;
            }
            
            plugin.getLogger().info("Found " + orders.size() + " pending order(s)");
            for (Order order : orders) {
                if ("card".equalsIgnoreCase(order.getPaymentMethod()) && !"completed".equalsIgnoreCase(order.getStatus())) {
                    if (plugin.getConfig().getBoolean("debug.enabled")) {
                        plugin.getLogger().info("Skipping order #" + order.getId() + " - waiting for payment confirmation");
                    }
                    continue;
                }
                
                if (plugin.getConfig().getBoolean("debug.enabled")) {
                    plugin.getLogger().info("Processing order #" + order.getId() + " for " + order.getNickname());
                }
                
                boolean success = orderHandler.processOrder(order);
                
                if (success) {
                    boolean marked = apiClient.markOrderAsDelivered(order.getId());
                    
                    if (marked) {
                        plugin.getLogger().info("Successfully processed order #" + order.getId());
                    } else {
                        plugin.getLogger().warning("Failed to mark order #" + order.getId() + " as delivered");
                    }
                    if (!"card".equalsIgnoreCase(order.getPaymentMethod())) {
                        apiClient.updateOrderStatus(order.getId(), "completed");
                    }
                } else {
                    apiClient.updateOrderStatus(order.getId(), "failed");
                    plugin.getLogger().warning("Order #" + order.getId() + " marked as failed");
                }
            }
            
        } catch (Exception e) {
            plugin.getLogger().severe("Error in OrderCheckTask: " + e.getMessage());
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                e.printStackTrace();
            }
        }
    }
}

