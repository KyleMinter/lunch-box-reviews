interface SingleValueValidator {
  validate: (value: string) => boolean;
  errorMessage: string;
}

interface MultiValueValidator {
  validate: (a: string, b: string) => boolean;
  errorMessageA: string;
  errorMessageB: string;
}


const dateValidator: SingleValueValidator = {
  validate: (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.valueOf());
  },
  errorMessage: '%s must be valid date'
};

const dateSequenceValidator: MultiValueValidator = {
  validate: (a: string, b: string): boolean => {
    const startDate = new Date(a);
    const endDate = new Date(b);
    return startDate <= endDate;
  },
  errorMessageA: '%s cannot be after %s',
  errorMessageB: '%s cannot be before %s'
};

const emptyValueValidator: SingleValueValidator = {
  validate: (value: string): boolean => {
    return value !== '';
  },
  errorMessage: '%s cannot be empty'
};

const emailValidtor: SingleValueValidator = {
  validate: (value: string): boolean => {
    // IDK. I ripped this from Google.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  },
  errorMessage: '%s must be a valid email'
};

const integerValidator: SingleValueValidator = {
  validate: (value: string): boolean => {
    const num = Number(value);
    return Number.isInteger(num);
  },
  errorMessage: '%s must be an integer'
};

export {
  dateValidator,
  dateSequenceValidator,
  emptyValueValidator,
  emailValidtor,
  integerValidator
};