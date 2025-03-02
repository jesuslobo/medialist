
export const TEST_MOCK_FILE_NAME = 'medialist.svg';

// used require() to get the file from the real fs, since vs.mock works only on imports
export const TEST_MOCK_FILE_BUFFER = require('fs/promises').readFile('public/medialist.svg');