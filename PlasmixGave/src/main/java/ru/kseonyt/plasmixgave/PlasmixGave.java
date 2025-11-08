package ru.kseonyt.plasmixgave;

import org.bukkit.plugin.java.JavaPlugin;
import ru.kseonyt.plasmixgave.api.ApiClient;
import ru.kseonyt.plasmixgave.command.PlasmixCommand;
import ru.kseonyt.plasmixgave.handler.OrderHandler;
import ru.kseonyt.plasmixgave.task.OrderCheckTask;

public final class PlasmixGave extends JavaPlugin {

    private ApiClient apiClient;
    private OrderHandler orderHandler;
    private OrderCheckTask orderCheckTask;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        apiClient = new ApiClient(this);
        orderHandler = new OrderHandler(this);
        PlasmixCommand plasmixCommand = new PlasmixCommand(this, apiClient, orderHandler);
        getCommand("plasmixgave").setExecutor(plasmixCommand);
        getCommand("plasmixgave").setTabCompleter(plasmixCommand);
        if (getConfig().getBoolean("polling.enabled")) {
            startOrderPolling();
        }
        
        getLogger().info("╔═══════════════════════════════════════╗");
        getLogger().info("║      PlasmixGave успешно запущен!     ║");
        getLogger().info("║                                       ║");
        getLogger().info("║  Server ID: " + String.format("%-25s", getConfig().getString("server.id")) + "║");
        getLogger().info("║  Mode: " + String.format("%-30s", getConfig().getString("server.mode")) + "║");
        getLogger().info("╚═══════════════════════════════════════╝");
    }

    @Override
    public void onDisable() {
        if (orderCheckTask != null) {
            orderCheckTask.cancel();
        }
        
        getLogger().info("PlasmixGave отключен!");
    }
    
    /**
     * Запустить автоматическую проверку заказов
     */
    private void startOrderPolling() {
        int interval = getConfig().getInt("polling.interval", 5);
        
        orderCheckTask = new OrderCheckTask(this, apiClient, orderHandler);
        orderCheckTask.runTaskTimerAsynchronously(this, 20L * 5, 20L * interval);
        
        getLogger().info("Автоматическая проверка заказов запущена (интервал: " + interval + "s)");
    }
    
    /**
     * Получить API клиент
     */
    public ApiClient getApiClient() {
        return apiClient;
    }
    
    /**
     * Получить обработчик заказов
     */
    public OrderHandler getOrderHandler() {
        return orderHandler;
    }
}
