// @ts-checks
// required modules
const piexif = require('piexifjs');

// utility functions
const getBase64DataFromJpegFile = file => file.toString('binary');
const getExifFromJpegFile = file => piexif.load(getBase64DataFromJpegFile(file));

/**
 * Internal function for debugging photo metadata (also referred to as exif data) - displays all metadata on the console
 * @param {*} exif the exif data from a photo
 */
function debugExif(exif) {
  for (const ifd in exif) {
    if (ifd == 'thumbnail') {
      const thumbnailData = exif[ifd] === null ? "null" : exif[ifd];
      console.log(`- thumbnail: ${thumbnailData}`);
    } else {
      console.log(`- ${ifd}`);
      for (const tag in exif[ifd]) {
        console.log(`    - ${piexif.TAGS[ifd][tag]['name']}: ${exif[ifd][tag]}`);
      }
    }
  }
}

/**
 * Scrubs all metadata from a given jpg file
 * @param {*} jpegFile that is to be scrubbed of metadata
 * @returns a fileBuffer containing the scrubbed jpg
 */
function clearMetaData(jpegFile) {
  const rawPhotoData = getBase64DataFromJpegFile(jpegFile);
  const scrubbedRawPhotoData = piexif.remove(rawPhotoData);
  fileBuffer = Buffer.from(scrubbedRawPhotoData, 'binary');
  return fileBuffer;
}

/**
 * A helper function that changes a location in the metadata information of a jpg
 * @param {*} jpegFile in which the photo location shall be changed
 * @param {*} latitude the latitude to which the location is changed
 * @param {*} latitudeRef the latitude reference to which the location is changed (N or S)
 * @param {*} longitude the longitude to which the location is changed
 * @param {*} longitudeRef the longitude reference to which the location is changed (W or E)
 * @returns a buffer containing the jpg with changed photo location
 */
function changePhotoLocation(jpegFile, latitude, latitudeRef, longitude, longitudeRef) {
  const changedPhotoExif = getBase64DataFromJpegFile(jpegFile);
  const newExif = {
    '0th': { ...changedPhotoExif['0th'] },
    'Exif': { ...changedPhotoExif['Exif'] },
    'GPS': { ...changedPhotoExif['GPS'] },
    'Interop': { ...changedPhotoExif['Interop'] },
    '1st': { ...changedPhotoExif['1st'] },
    'thumbnail': null
  };

  newExif['GPS'][piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(latitude);
  newExif['GPS'][piexif.GPSIFD.GPSLatitudeRef] = latitudeRef;

  newExif['GPS'][piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(longitude);
  newExif['GPS'][piexif.GPSIFD.GPSLongitudeRef] = longitudeRef;

  const newExifBinary = piexif.dump(newExif);
  const changedPhotoData = piexif.insert(newExifBinary, changedPhotoExif);

  return Buffer.from(changedPhotoData, 'binary');
}

/**
 * Adds noise to a photo location of a jpg by adding a random distance between 1km and 5km to latitude and longitude
 * @param {*} jpegFile that the location is extracted from to add noise 
 * @returns the result of the changePhotoLocation() function
 */
function addNoiseToLocation(jpegFile) {
  const photoExif = getExifFromJpegFile(jpegFile);
  const palmExifs = [photoExif];

  for (const [index, exif] of palmExifs.entries()) {
    const latitude = exif['GPS'][piexif.GPSIFD.GPSLatitude];
    const latitudeRef = exif['GPS'][piexif.GPSIFD.GPSLatitudeRef];
    const longitude = exif['GPS'][piexif.GPSIFD.GPSLongitude];
    const longitudeRef = exif['GPS'][piexif.GPSIFD.GPSLongitudeRef];

    const latitudeMultiplier = latitudeRef == 'N' ? 1 : -1;
    const decimalLatitude = latitudeMultiplier * piexif.GPSHelper.dmsRationalToDeg(latitude);
    const longitudeMultiplier = longitudeRef == 'E' ? 1 : -1;
    const decimalLongitude = longitudeMultiplier * piexif.GPSHelper.dmsRationalToDeg(longitude);

    //Earth’s radius, sphere
    R = 6378137;

    //offsets in meters between 1 and 5 km
    max = 5000;
    min = 1000;
    dn = Math.random() * (max - min) + min;
    de = Math.random() * (max - min) + min;

    //Coordinate offsets in radians
    dLat = dn / R;
    dLon = de / (R * Math.cos(Math.PI * decimalLatitude / 180));

    //OffsetPosition, decimal degrees
    noisedLatitude = decimalLatitude + dLat * 180 / Math.PI;
    noisedLongitude = decimalLongitude + dLon * 180 / Math.PI;

    return changePhotoLocation(jpegFile, noisedLatitude, latitudeRef, noisedLongitude, longitudeRef);
  }
}

/**
 * an array of possible transformations that can be applied to a jpg
 */
const jpgTransformations = {
  "clearMetaData": jpg => clearMetaData(jpg),
  "addNoiseToLocation": jpg => addNoiseToLocation(jpg),
  // "changePhotoLocation": jpg => changePhotoLocation(jpg)
}

/**
 * Defines which filter shall be applied to a given jpg
 * @param {*} jpgFile the jpg file that is to be filtered
 * @param {*} transformation the type of transformation from const jpgTransformations that is to be applied to the jpg
 * @returns the transformed jpg according to the function that was called in const jpgTransformations
 */
function filter(jpgFile, { transformation }) {
  return jpgTransformations[transformation](jpgFile);
}

module.exports = {
  filter
}