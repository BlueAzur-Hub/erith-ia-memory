import { EventBus } from "./core/event-bus.js";
import { ModuleManager } from "./core/module-manager.js";
import { installPointerReorder } from "./core/admin-layout.js";

import { marketModule } from "./modules/market.js";
import { marketMemoryModule } from "./modules/market-memory.js";
import { analysisModule } from "./modules/analysis.js";
import { analyticalMemoryModule } from "./modules/analytical-memory.js";
import { decisionBoardModule } from "./modules/decision-board.js";
import { simulationModule } from "./modules/simulation.js";
import { systemModule } from "./modules/system.js";
import { erithModule } from "./modules/erith.js";
import { observabilityModule } from "./modules/observability.js";

const BUILD = "39.0";
const STORAGE_KEY = "erith.agent_crypto.administrator39.layout.v1";

const eventBus = new EventBus();
const manager = new ModuleManager({
  grid: document.querySelector("#admin-grid"),
  template: document.querySelector("#module-card-template"),
  closedTray: document.querySelector("#closed-modules-tray"),
  eventBus,
  storageKey: STORAGE_KEY,
});

const moduleDefinitions = [
  marketModule,
  marketMemoryModule,
  analysisModule,
  analyticalMemoryModule,
  decisionBoardModule,
  simulationModule,
  systemModule,
  erithModule,
  observabilityModule,
];

for (const moduleDefinition of moduleDefinitions) manager.register(moduleDefinition);
manager.restoreLayout();
installPointerReorder({ grid: document.querySelector("#admin-grid"), manager });

document.querySelector("#reset-layout").addEventListener("click", () => manager.resetLayout());

eventBus.on("module-state-change", ({ id, nextState }) => {
  document.documentElement.dataset.lastModuleEvent = `${id}:${nextState}`;
});

document.documentElement.dataset.agentCryptoBuild = BUILD;
document.documentElement.dataset.administratorMode = "core-skeleton";
