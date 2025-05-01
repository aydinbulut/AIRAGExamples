/**
 * @file contains functions to generate synthetic data for testing purposes.
 * It uses the Faker library to create random data for various entities.
 */

import { faker } from '@faker-js/faker';

export function createRandomBook() {
  return {
    id: faker.string.uuid(),
    title: faker.book.title(),
    author: faker.book.author(),
    genre: faker.book.genre(),
    publisher: faker.book.publisher(),
    publishDate: faker.date.anytime(),
    pages: faker.number.int({ min: 100, max: 1000 }),
    bookFormat: faker.book.format(),
  };
}

export function createRandomBooks(count) {
  return faker.helpers.multiple(createRandomBook, {
    count: count,
  });
}