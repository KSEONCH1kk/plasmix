package ru.kseonyt.plasmixgave.handler;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import ru.kseonyt.plasmixgave.PlasmixGave;
import ru.kseonyt.plasmixgave.model.Order;

public class OrderHandler {
    private final PlasmixGave plugin;

    public OrderHandler(PlasmixGave plugin) {
        this.plugin = plugin;
    }

    /**
     * Обработать заказ
     */
    public boolean processOrder(Order order) {
        try {
            String serverId = plugin.getConfig().getString("server.id");
            if (!order.getMode().equalsIgnoreCase(plugin.getConfig().getString("server.mode"))) {
                if (plugin.getConfig().getBoolean("debug.enabled")) {
                    plugin.getLogger().info("Order " + order.getId() + " is for different mode: " + order.getMode());
                }
                return false;
            }
            
            final String nickname = order.getNickname();
            String command = order.getCommand();
            final boolean isTestMode = order.isTestMode();
            
            if (command == null || command.isEmpty()) {
                plugin.getLogger().warning("Order " + order.getId() + " has no command!");
                return false;
            }
            final String finalCommand = replacePlaceholders(command, order);
            final int orderId = order.getId();
            final String productName = order.getProductName();
            final int cashbackAmount = order.getCashbackAmount();
            final String cashbackCommand = order.getCashbackCommand();
            
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                plugin.getLogger().info("Executing command for order " + orderId + ": " + finalCommand);
                if (cashbackCommand != null && !cashbackCommand.isEmpty()) {
                    plugin.getLogger().info("Cashback command: " + cashbackCommand);
                }
            }
            
            if (isTestMode) {
                plugin.getLogger().info("[TEST MODE] Processing test order #" + orderId);
            }
            Bukkit.getScheduler().runTask(plugin, () -> {
                boolean success = Bukkit.dispatchCommand(Bukkit.getConsoleSender(), finalCommand);
                
                if (success) {
                    plugin.getLogger().info("Successfully processed order #" + orderId + " for player " + nickname);
                    if (cashbackAmount > 0 && cashbackCommand != null && !cashbackCommand.isEmpty()) {
                        String finalCashbackCommand = replacePlaceholders(cashbackCommand, order);
                        boolean cashbackSuccess = Bukkit.dispatchCommand(Bukkit.getConsoleSender(), finalCashbackCommand);
                        
                        if (cashbackSuccess) {
                            plugin.getLogger().info("Successfully gave cashback " + cashbackAmount + " to player " + nickname);
                        } else {
                            plugin.getLogger().warning("Failed to execute cashback command for order #" + orderId);
                        }
                    }
                    Player player = Bukkit.getPlayer(nickname);
                    if (player != null && player.isOnline()) {
                        player.sendMessage("§a§l[PLASMIX] §fВаша покупка §e" + productName + " §fбыла успешно выдана!");
                        
                        if (cashbackAmount > 0) {
                            player.sendMessage("§a§l[PLASMIX] §fВы получили §6" + cashbackAmount + " коинов §fкэшбека!");
                        }
                    }
                } else {
                    plugin.getLogger().warning("Failed to execute command for order #" + orderId);
                }
            });
            
            return true;
            
        } catch (Exception e) {
            plugin.getLogger().severe("Error processing order " + order.getId() + ": " + e.getMessage());
            if (plugin.getConfig().getBoolean("debug.enabled")) {
                e.printStackTrace();
            }
            return false;
        }
    }

    /**
     * Заменить плейсхолдеры в команде
     */
    private String replacePlaceholders(String command, Order order) {
        command = command.replace("%player%", order.getNickname());
        command = command.replace("%product%", order.getProductName());
        command = command.replace("%product_name%", order.getProductName());
        command = command.replace("%product_type%", order.getProductType());
        command = command.replace("%product_id%", String.valueOf(order.getProductId()));
        command = command.replace("%price%", String.valueOf(order.getFinalPrice()));
        command = command.replace("%order_price%", String.valueOf(order.getFinalPrice()));
        command = command.replace("%final_price%", String.valueOf(order.getFinalPrice()));
        command = command.replace("%order_id%", String.valueOf(order.getId()));
        command = command.replace("%mode%", order.getMode());
        command = command.replace("%payment_method%", order.getPaymentMethod());
        if (order.getPromoCode() != null && !order.getPromoCode().isEmpty()) {
            command = command.replace("%promocode%", order.getPromoCode());
            command = command.replace("%promo_code%", order.getPromoCode());
        }
        command = command.replace("%discount_amount%", String.valueOf(order.getDiscountAmount()));
        command = command.replace("%cashback_amount%", String.valueOf(order.getCashbackAmount()));
        command = command.replace("%cashback_percent%", String.valueOf(order.getCashbackPercent()));
        if (order.getEmail() != null && !order.getEmail().isEmpty()) {
            command = command.replace("%email%", order.getEmail());
        }
        if ("donation".equalsIgnoreCase(order.getProductType())) {
            String duration = order.getDuration();
            if (duration != null) {
                command = command.replace("%duration%", duration);
                int days = getDurationInDays(duration);
                command = command.replace("%duration_days%", String.valueOf(days));
            }
        }
        if ("item".equalsIgnoreCase(order.getProductType())) {
            command = command.replace("%quantity%", String.valueOf(order.getQuantity()));
        }
        
        return command;
    }

    /**
     * Конвертировать длительность в дни
     */
    private int getDurationInDays(String duration) {
        switch (duration.toLowerCase()) {
            case "1month":
                return 30;
            case "3months":
                return 90;
            case "forever":
                return -1; // -1 означает навсегда
            default:
                return 30;
        }
    }
}

