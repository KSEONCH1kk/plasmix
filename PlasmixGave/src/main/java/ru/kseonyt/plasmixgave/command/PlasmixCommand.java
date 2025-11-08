package ru.kseonyt.plasmixgave.command;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import ru.kseonyt.plasmixgave.PlasmixGave;
import ru.kseonyt.plasmixgave.api.ApiClient;
import ru.kseonyt.plasmixgave.handler.OrderHandler;
import ru.kseonyt.plasmixgave.model.Order;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class PlasmixCommand implements CommandExecutor, TabCompleter {
    private final PlasmixGave plugin;
    private final ApiClient apiClient;
    private final OrderHandler orderHandler;

    public PlasmixCommand(PlasmixGave plugin, ApiClient apiClient, OrderHandler orderHandler) {
        this.plugin = plugin;
        this.apiClient = apiClient;
        this.orderHandler = orderHandler;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!sender.hasPermission("plasmixgave.admin")) {
            sender.sendMessage("§l[PLASMIX] §fУ вас нет прав для использования этой команды!");
            return true;
        }

        if (args.length == 0) {
            sendHelp(sender);
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "check":
                handleCheck(sender);
                break;
                
            case "reload":
                handleReload(sender);
                break;
            case "debug":
                handleDebug(sender);
                break;
                
            default:
                sendHelp(sender);
                break;
        }

        return true;
    }

    private void handleCheck(CommandSender sender) {
        sender.sendMessage("§l[PLASMIX] §fПроверка новых заказов...");
        
        plugin.getServer().getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                List<Order> orders = apiClient.getPendingOrders();
                
                if (orders.isEmpty()) {
                    sender.sendMessage("§l[PLASMIX] §fНет необработанных заказов");
                    return;
                }
                
                sender.sendMessage("§l[PLASMIX] §fНайдено заказов: " + orders.size());
                
                for (Order order : orders) {
                    boolean success = orderHandler.processOrder(order);
                    
                    if (success) {
                        apiClient.updateOrderStatus(order.getId(), "completed");
                        sender.sendMessage("§l[✓] §fЗаказ #" + order.getId() + " - " + order.getNickname() + " - " + order.getProductName());
                    } else {
                        apiClient.updateOrderStatus(order.getId(), "failed");
                        sender.sendMessage("§l[✗] §fЗаказ #" + order.getId() + " - Ошибка обработки");
                    }
                }
                
            } catch (Exception e) {
                sender.sendMessage("§l[PLASMIX] Ошибка: " + e.getMessage());
            }
        });
    }

    private void handleReload(CommandSender sender) {
        plugin.reloadConfig();
        sender.sendMessage("§l[PLASMIX] Конфигурация перезагружена!");
    }


    private void handleDebug(CommandSender sender) {
        boolean currentDebug = plugin.getConfig().getBoolean("debug.enabled");
        plugin.getConfig().set("debug.enabled", !currentDebug);
        plugin.saveConfig();
        
        sender.sendMessage("§l[PLASMIX] §fРежим отладки:" + (!currentDebug ? "Включен" : "Выключен"));
    }

    private void sendHelp(CommandSender sender) {
        sender.sendMessage("/plasmixgave check §f- Проверить новые заказы");
        sender.sendMessage("/plasmixgave reload §f- Перезагрузить конфигурацию");
        sender.sendMessage("/plasmixgave debug §f- Переключить режим отладки");
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            return Arrays.asList("check", "reload", "debug");
        }
        return new ArrayList<>();
    }
}

