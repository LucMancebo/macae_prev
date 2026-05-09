"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.prisma = void 0;
var prisma_1 = require("../../prisma/prisma");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
var prisma_2 = require("../../prisma/prisma");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(prisma_2).default; } });
