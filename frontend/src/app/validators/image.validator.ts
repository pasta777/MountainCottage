import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { Observable, of } from "rxjs";

export function createPictureDimensionValidator(minWidth: number, minHeight: number, maxWidth: number, maxHeight: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const file = control.value as File;
        if(!file || !(file instanceof File)) {
            return of(null);
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        if(!allowedTypes.includes(file.type)) {
            return of({pictureType: true});
        }

        return new Observable(observer => {
            const picture = new Image();
            picture.src = URL.createObjectURL(file);
            picture.onload = () => {
                const width = picture.width;
                const height = picture.height;
                URL.revokeObjectURL(picture.src);

                if(width < minWidth || height < minHeight) {
                    observer.next({minDimensions: {required: `${minWidth}x${minHeight}`, actual: `${width}x${height}`}});
                } else if(width > maxWidth || height > maxHeight) {
                    observer.next({maxDimensions: {required: `${maxWidth}x${maxHeight}`, actual: `${width}x${height}`}});
                } else {
                    observer.next(null);
                }
                observer.complete();
            };
            picture.onerror = () => {
                observer.next({invalidPicture: true});
                observer.complete();
            };
        });
    };
}