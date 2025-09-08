"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewTaskDto = exports.SubmitTaskDto = exports.AssignTaskDto = exports.CreateTaskDto = exports.TaskStatusEnum = void 0;
const class_validator_1 = require("class-validator");
var TaskStatusEnum;
(function (TaskStatusEnum) {
    TaskStatusEnum["OPEN"] = "OPEN";
    TaskStatusEnum["ASSIGNED"] = "ASSIGNED";
    TaskStatusEnum["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatusEnum["IN_REVIEW"] = "IN_REVIEW";
    TaskStatusEnum["APPROVED"] = "APPROVED";
    TaskStatusEnum["REJECTED"] = "REJECTED";
    TaskStatusEnum["DONE"] = "DONE";
})(TaskStatusEnum || (exports.TaskStatusEnum = TaskStatusEnum = {}));
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "stage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "dueDate", void 0);
class AssignTaskDto {
}
exports.AssignTaskDto = AssignTaskDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AssignTaskDto.prototype, "userId", void 0);
class SubmitTaskDto {
}
exports.SubmitTaskDto = SubmitTaskDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitTaskDto.prototype, "note", void 0);
class ReviewTaskDto {
}
exports.ReviewTaskDto = ReviewTaskDto;
__decorate([
    (0, class_validator_1.IsEnum)(TaskStatusEnum),
    __metadata("design:type", String)
], ReviewTaskDto.prototype, "decision", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewTaskDto.prototype, "note", void 0);
//# sourceMappingURL=task.dtos.js.map