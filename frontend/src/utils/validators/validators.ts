interface Validator {
    validate: (value: string) => boolean;
    errorMessage: string;
}


const dateValidator: Validator = {
    validate: (value: string): boolean => {
        const date = new Date(value);
        return !isNaN(date.valueOf());
    },
    errorMessage: '%s must be valid date'
};

const dateSequenceValidator = {
    validate: (start: string, end: string): boolean => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return startDate <= endDate;
    },
    startErrorMessage: '%s cannot be after end date',
    endErrorMessage: '%s cannot be before start date'
};

const emptyValueValidator: Validator = {
    validate: (value: string): boolean => {
        return value !== '';
    },
    errorMessage: '%s cannot be empty'
};

const emailValidtor: Validator = {
    validate: (value: string): boolean => {
        // IDK. I ripped this from Google.
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value);
    },
    errorMessage: '%s must be a valid email'
};

const integerValidator: Validator = {
    validate: (value: string): boolean => {
        const num = Number(value);
        return Number.isInteger(num);
    },
    errorMessage: '%s must be an integer'
};

export default Validator;
export  {
    dateValidator,
    dateSequenceValidator,
    emptyValueValidator,
    emailValidtor,
    integerValidator
};