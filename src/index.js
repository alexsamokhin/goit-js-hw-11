import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';
import axios from 'axios';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');

const simpleligthbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

const AUTHORIZATION_KEY = '31662935-30b6bbf53b77f4802f316bbe7';
const BASE_URL = 'https://pixabay.com/api/';

let page = 1;
const perPage = 40;
let observer;
const options = {
  root: null,
  rootMargin: '600px',
  threshold: 1.0,
};

searchForm.addEventListener('submit', onSubmit);

function onSubmit(evt) {
  evt.preventDefault();
  gallery.innerHTML = '';
  if (page > 1) {
    observer.unobserve(guard);
  }
  page = 1;

  const searchQuery = evt.target.elements.searchQuery.value.trim();
  observer = new IntersectionObserver(onLoad, options);
  observer.observe(guard);

  function onLoad(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        pixApi(searchQuery, perPage, page)
          .then(resp => {
            if(!searchQuery) {
              Notiflix.Notify.failure(
                "Write something to find."
              )
              return
            }
            if (!resp.data.hits.length) {
              throw new Error();
            }
            gallery.insertAdjacentHTML(
              'beforeend',
              createMarkup(resp.data.hits)
            );
            if (page === 1) {
              Notiflix.Notify.success(
                `Hooray! We found: ${resp.data.total} images.`
              );
            }
            if (page > 1) {
              const { height: cardHeight } =
                gallery.firstElementChild.getBoundingClientRect();
              window.scrollBy({
                top: cardHeight * 2,
                behavior: 'smooth',
              });
            }
            if (page === Math.ceil(resp.data.totalHits / perPage)) {
              observer.unobserve(guard);
              Notiflix.Notify.info(
                "We're sorry, but you've reached the end of search results"
              )
            }
            page += 1;
          })
          .catch(() => {
            Notiflix.Notify.failure(
              'Sorry, there are no images matching your search query. Please try again.'
            );
            observer.unobserve(guard);
          })
          .then(() => simpleligthbox.refresh());
      }
    });
  }
}

function pixApi(searchQuery, perPage, page) {
  return axios.get(
    `${BASE_URL}?key=${AUTHORIZATION_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
  );
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photocard"><div class="wrapper"><a class="gallery__item" href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" /></a></div>
          <div class="info">
            <p class="info__item">
              <b>Likes</b>
              <span>${likes}</span>
            </p>
            <p class="info__item">
              <b>Views</b>
              <span>${views}</span>
            </p>
            <p class="info__item">
              <b>Comments</b>
              <span>${comments}</span>
            </p>
            <p class="info__item">
              <b>Downloads</b>
              <span>${downloads}</span>
            </p>
          </div>
        </div>`
    )
    .join('');
}