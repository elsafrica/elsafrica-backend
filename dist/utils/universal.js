"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUpcaseFirstLetter = void 0;
const toUpcaseFirstLetter = (word) => {
    return word.substring(0, 1).toUpperCase() + word.substring(1);
};
exports.toUpcaseFirstLetter = toUpcaseFirstLetter;
