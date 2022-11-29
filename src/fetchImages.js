import { Notify } from 'notiflix/build/notiflix-notify-aio';

export async function fetchCountries(name) {
  try {
        const response = await fetch(
            `https://restcountries.com/v3.1/name/${name}?fields=name,capital,population,flags,languages`
        );
        if (!response.ok) {
            throw new Error(response.status);
        }
        return await response.json();
    } catch {
        Notify.failure('Oops, there is no country with that name');
    }
}