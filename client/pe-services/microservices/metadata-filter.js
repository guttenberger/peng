// required modules
const fs = require('fs');
const piexif = require('piexifjs');
const { domainToUnicode } = require('url');
// utility functions
const getBase64DataFromJpegFile = filename => fs.readFileSync(filename).toString('binary');
const getExifFromJpegFile = filename => piexif.load(getBase64DataFromJpegFile(filename));

// Get the Exif data for the palm tree photos
const palmphoto = "C:/Users/U760165/Programming/Uni/pe-project/peng/client/pe-services/microservices/palm tree 1.jpg"
const palm1Exif = getExifFromJpegFile(palmphoto);
// debugging to see photo data
debugExif(palm1Exif);

//clearMetaData(palmphoto);

// Change the latitude to Area 51’s: 37° 14' 3.6" N
const newLatitudeDecimal = 37.0 + (14 / 60) + (3.6 / 3600);
const newLatitudeRef = 'N';
// Change the longitude to Area 51’s: 115° 48' 23.99" W
const newLongitudeDecimal = 115.0 + (48.0 / 60) + (23.99 / 3600);
const newLongitudeRef = 'w';
//changePhotoLocation(palmphoto, newLatitudeDecimal, newLatitudeRef, newLongitudeDecimal, newLongitudeRef);


//addNoiseToLocation(palmphoto);

// Given a Piexifjs object, this function displays its Exif tags
// in a human-readable format
// this is only for easier handling while programming
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

function clearMetaData (jpegFile) {
  // Create a “scrubbed” copy of the original photo and save it
  const rawPhotoData = getBase64DataFromJpegFile(jpegFile);
  const scrubbedRawPhoto = jpegFile + "_scrubbed.jpg";
  const scrubbedRawPhotoData = piexif.remove(rawPhotoData);
  fileBuffer = Buffer.from(scrubbedRawPhotoData, 'binary');
  fs.writeFileSync(scrubbedRawPhoto, fileBuffer);
  debugExif(getExifFromJpegFile(scrubbedRawPhoto));
  // TODO: here the photo should not be saved but displayed as a download link(?) to the user
  return scrubbedRawPhoto;
}

function changePhotoLocation (jpegFile, latitude, latitudeRef, longitude, longitudeRef) {
  const changedPhotoExif = getBase64DataFromJpegFile(jpegFile);
  const changedRawPhoto = jpegFile + '_changed.jpg';
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

  let fileBuffer = Buffer.from(changedPhotoData, 'binary');
  fs.writeFileSync(changedRawPhoto, fileBuffer);
  debugExif(newExif);
}

function addNoiseToLocation (jpegFile) {
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

    console.log(decimalLatitude);
    console.log(decimalLongitude);


    //Earth’s radius, sphere
    R=6378137;

    //offsets in meters between 1 and 5 km
    max= 5000;
    min= 1000;
    dn = Math.random() * (max - min) + min;
    de = Math.random() * (max - min) + min;

    //Coordinate offsets in radians
    dLat = dn/R;
    dLon = de/(R*Math.cos(Math.PI*decimalLatitude/180));

    //OffsetPosition, decimal degrees
    noisedLatitude = decimalLatitude + dLat * 180/Math.PI;
    noisedLongitude = decimalLongitude + dLon * 180/Math.PI;

    changePhotoLocation(jpegFile, noisedLatitude, latitudeRef, noisedLongitude, longitudeRef);
}



}
