import { AbstractControl } from "@angular/forms";
import { ValidationErrors } from "@angular/forms";

export function luhnValidator(control: AbstractControl): ValidationErrors | null {
  let cardNumber = control.value as string;
  if(!cardNumber) {
    return null;
  }

  cardNumber = cardNumber.replace(/\s/g, '');

  let sum = 0;
  let shouldDouble = false;

  for(let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);

    if(shouldDouble) {
      digit *= 2;
      if(digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  if(sum % 10 === 0) {
    return null;
  } else {
    return {luhnInvalid: true};
  }
}