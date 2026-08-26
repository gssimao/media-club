/** Example payload shown in the admin import dialog (client-safe). */
export const IMPORT_JSON_EXAMPLE = `{
  "movies": [
    {
      "externalId": "550",
      "title": "Fight Club",
      "year": 1999,
      "coverUrl": "https://image.tmdb.org/t/p/w342/poster.jpg"
    }
  ],
  "music": [
    {
      "externalId": "12345",
      "title": "Artist: Album Title",
      "year": 1973
    }
  ],
  "books": [
    {
      "externalId": "OL45804W",
      "title": "Dune",
      "subtitle": "Frank Herbert",
      "year": 1965
    }
  ],
  "wishlist": [
    {
      "category": "movie",
      "externalId": "27205",
      "title": "Inception"
    }
  ]
}`;
