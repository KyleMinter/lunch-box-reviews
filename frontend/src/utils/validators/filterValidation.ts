import { EntityType } from "@lunch-box-reviews/shared-types";
import SearchFilters from "../search/searchFilters";
import { dateSequenceValidator, emailValidtor, emptyValueValidator } from "./validators";
import { sprintf } from "sprintf-js";

function validateFilters(filters: SearchFilters): string[] {
  const errors: string[] = [];
  switch (filters.entityType) {
    case EntityType.Review:
      validateReviewFilters(filters, errors);
      break;
    case EntityType.User:
      validateUserFilters(filters, errors);
      break;
    case EntityType.FoodItem:
      validateFoodFilters(filters, errors);
      break;
  }

  return errors;
}

function validateReviewFilters(filters: SearchFilters, errors: string[]) {
  if (filters.startDate.selected && filters.endDate.selected
    && filters.startDate.value && filters.endDate.value) {
    if (!dateSequenceValidator.validate(
      filters.startDate.value.toString(),
      filters.endDate.value.toString()
    )) {
      errors.push(sprintf(dateSequenceValidator.errorMessageA, 'Start date', 'End date'));
      errors.push(sprintf(dateSequenceValidator.errorMessageB, 'End date', 'Start date'));
    }
  }
}

function validateUserFilters(filters: SearchFilters, errors: string[]) {
  if (filters.userName.selected) {
    if (!emptyValueValidator.validate(filters.searchInput)) {
      errors.push(sprintf(emptyValueValidator.errorMessage, 'Username'));
    }
  }

  if (filters.userEmail.selected) {
    if (!emptyValueValidator.validate(filters.searchInput)) {
      errors.push(sprintf(emptyValueValidator.errorMessage, 'Email'));
    }
    
    if (!emailValidtor.validate(filters.searchInput)) {
      errors.push(sprintf(emailValidtor.errorMessage, 'Email'));
    }
  }
}

function validateFoodFilters(filters: SearchFilters, errors: string[]) {
  if (filters.foodName.selected) {
    if (!emptyValueValidator.validate(filters.searchInput)) {
      errors.push(sprintf(emptyValueValidator.errorMessage, 'Name'));
    }
  }

  if (filters.foodOrigin.selected) {
    if (!emptyValueValidator.validate(filters.searchInput)) {
      errors.push(sprintf(emptyValueValidator.errorMessage, 'Location'));
    }
  }
}

export default validateFilters;