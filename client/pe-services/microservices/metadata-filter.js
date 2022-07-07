// jpeg Bilder mit Kamera gemacht idealerweise für Metadaten, welche Daten sind dort dabei?`
// online Arzt schickt man Bilder und wenn jemand das Bild abrufen will wird anonymisiert, zB der Ort als Metadatum weggelassen
// welche Metadaten hat ein Handy-Foto?
// einfach weglöschen

// required modules
const fs = require('fs');
const piexif = require('piexifjs');
// utility functions
const getBase64DataFromJpegFile = filename => fs.readFileSync(filename).toString('binary');
const getExifFromJpegFile = filename => piexif.load(getBase64DataFromJpegFile(filename));

// Get the Exif data for the palm tree photos
// TODO: replace with a function to get a photo from s3 server
const palmphoto = "C:/Users/U760165/Programming/Uni/pe-project/peng/client/pe-web/pe-services/microservices/palm tree 1.jpg"
const palm1Exif = getExifFromJpegFile(palmphoto);
// debugging to see if the data really has been scrubbed
debugExif(palm1Exif);

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
  // Create a “scrubbed” copy of the original hotel photo and save it
  const rawPhotoData = getBase64DataFromJpegFile(jpegFile);
  const scrubbedRawPhoto = jpegFile + "_scrubbed.jpg";
  const scrubbedRawPhotoData = piexif.remove(rawPhotoData);
  fileBuffer = Buffer.from(scrubbedRawPhotoData, 'binary');
  fs.writeFileSync(scrubbedRawPhoto, fileBuffer);
  debugExif(getExifFromJpegFile(scrubbedRawPhoto));
  // TODO: here the photo should not be saved but displayed as a download link(?) to the user
  return scrubbedRawPhoto;
}

clearMetaData(palmphoto);

function changePhotoLocation (jpegFile) {
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

  // Change the latitude to Area 51’s: 37° 14' 3.6" N
  const newLatitudeDecimal = 37.0 + (14 / 60) + (3.6 / 3600);
  newExif['GPS'][piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(newLatitudeDecimal);
  newExif['GPS'][piexif.GPSIFD.GPSLatitudeRef] = 'N';

  // Change the longitude to Area 51’s: 115° 48' 23.99" W
  const newLongitudeDecimal = 115.0 + (48.0 / 60) + (23.99 / 3600);
  newExif['GPS'][piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(newLongitudeDecimal);
  newExif['GPS'][piexif.GPSIFD.GPSLongitudeRef] = 'W';

  const newExifBinary = piexif.dump(newExif);
  const changedPhotoData = piexif.insert(newExifBinary, changedPhotoExif);

  let fileBuffer = Buffer.from(changedPhotoData, 'binary');
  fs.writeFileSync(changedRawPhoto, fileBuffer);
}

changePhotoLocation(palmphoto);

// TODO: Noch einzelne Filter schreiben, zB Datum verallgemeinern ohne Stunden, etc - Standort ändern auf einen in der Config festgelegten Standort




