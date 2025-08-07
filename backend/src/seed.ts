import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/user.model';
import Cottage from './models/cottage.model';
import Reservation from './models/reservation.model';
import Review from './models/review.model';

const MONGO_URI = 'mongodb://localhost:27017/mountain_cottage';

// --- Funkcije za generisanje podataka ---

/**
 * Generiše validnu lozinku koja zadovoljava sledeće uslove:
 * - Dužina 6-10 karaktera
 * - Najmanje 1 veliko slovo
 * - Najmanje 3 mala slova
 * - Najmanje 1 broj
 * - Najmanje 1 specijalan karakter
 */
const generateValidPassword = (base: string): string => {
  // Primer: "Vlada" postaje "Vlada!ab12"
  return `${base.charAt(0).toUpperCase()}${base.slice(1).toLowerCase()}!ab12`;
};
  

/**
 * Generiše validan broj kreditne kartice koristeći Luhn algoritam.
 * @param prefix - Prefiks kartice (npr. '4' za Visu, '5' za Mastercard).
 * @param length - Ukupna dužina broja kartice.
 */
const generateLuhnNumber = (prefix: string, length: number): string => {
  let cardNumber = prefix;
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10);
  }

  let sum = 0;
  let shouldDouble = true;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return cardNumber + checkDigit;
};

// --- Glavna funkcija za popunjavanje baze ---

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('Brisanje postojećih podataka...');
    await User.deleteMany({});
    await Cottage.deleteMany({});
    await Reservation.deleteMany({});
    await Review.deleteMany({});

    console.log('Dodavanje novih podataka...');

    // --- Kreiranje Korisnika ---

    // Administratori
    const admin1 = await User.create({
      username: 'admin', password: await bcrypt.hash(generateValidPassword('Admin'), 10), name: 'Admin', surname: 'Glavni', gender: 'M', address: 'Administrativna 1', phoneNumber: '061111111', email: 'admin@mc.com', userType: 'administrator', status: 'active', creditCardNumber: generateLuhnNumber('4', 16)
    });
    const admin2 = await User.create({
        username: 'superadmin', password: await bcrypt.hash(generateValidPassword('Super'), 10), name: 'Super', surname: 'Admin', gender: 'F', address: 'Administrativna 2', phoneNumber: '062222222', email: 'superadmin@mc.com', userType: 'administrator', status: 'active', creditCardNumber: generateLuhnNumber('5', 16)
      });
  

    // Vlasnici
    const owners = await User.insertMany([
      { username: 'vlada', password: await bcrypt.hash(generateValidPassword('Vlada'), 10), name: 'Vladimir', surname: 'Janković', gender: 'M', address: 'Kopaonik bb', phoneNumber: '063333333', email: 'vlada@example.com', userType: 'owner', status: 'active', creditCardNumber: generateLuhnNumber('4', 16)},
      { username: 'milica', password: await bcrypt.hash(generateValidPassword('Milica'), 10), name: 'Milica', surname: 'Stojanović', gender: 'F', address: 'Divčibare 12', phoneNumber: '064444444', email: 'milica@example.com', userType: 'owner', status: 'active', creditCardNumber: generateLuhnNumber('5', 16)},
      { username: 'stefan', password: await bcrypt.hash(generateValidPassword('Stefan'), 10), name: 'Stefan', surname: 'Đorđević', gender: 'M', address: 'Zlatibor, Gajevi', phoneNumber: '065555555', email: 'stefan@example.com', userType: 'owner', status: 'active', creditCardNumber: generateLuhnNumber('36', 14)},
      { username: 'jelena', password: await bcrypt.hash(generateValidPassword('Jelena'), 10), name: 'Jelena', surname: 'Marković', gender: 'F', address: 'Tara, Kaluđerske Bare', phoneNumber: '066666666', email: 'jelena@example.com', userType: 'owner', status: 'active', creditCardNumber: generateLuhnNumber('4', 16)},
      { username: 'nikola', password: await bcrypt.hash(generateValidPassword('Nikola'), 10), name: 'Nikola', surname: 'Ilić', gender: 'M', address: 'Goč, Dobra Voda', phoneNumber: '067777777', email: 'nikola@example.com', userType: 'owner', status: 'inactive', creditCardNumber: generateLuhnNumber('5', 16)},
    ]);

    // Turisti
    const tourists = await User.insertMany([
        { username: 'turista1', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Marko', surname: 'Marković', gender: 'M', address: 'Beogradska 1', phoneNumber: '061234567', email: 'marko@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('4', 16)},
        { username: 'turista2', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Ana', surname: 'Anić', gender: 'F', address: 'Novosadska 2', phoneNumber: '062345678', email: 'ana@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('5', 16)},
        { username: 'turista3', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Petar', surname: 'Perić', gender: 'M', address: 'Niška 3', phoneNumber: '063456789', email: 'petar@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('36', 14)},
        { username: 'turista4', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Ivana', surname: 'Ivanović', gender: 'F', address: 'Subotička 4', phoneNumber: '064567890', email: 'ivana@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('4', 16)},
        { username: 'turista5', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Luka', surname: 'Lukić', gender: 'M', address: 'Kragujevačka 5', phoneNumber: '065678901', email: 'luka@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('5', 16)},
        { username: 'turista6', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Sofija', surname: 'Simić', gender: 'F', address: 'Kraljevačka 6', phoneNumber: '066789012', email: 'sofija@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('4', 16)},
        { username: 'turista7', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Filip', surname: 'Filipović', gender: 'M', address: 'Čačanska 7', phoneNumber: '067890123', email: 'filip@example.com', userType: 'tourist', status: 'inactive', creditCardNumber: generateLuhnNumber('5', 16)},
        { username: 'turista8', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Dunja', surname: 'Dunić', gender: 'F', address: 'Užička 8', phoneNumber: '068901234', email: 'dunja@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('36', 14)},
        { username: 'turista9', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Vuk', surname: 'Vuković', gender: 'M', address: 'Valjevska 9', phoneNumber: '069012345', email: 'vuk@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('4', 16)},
        { username: 'turista10', password: await bcrypt.hash(generateValidPassword('Turista'), 10), name: 'Sara', surname: 'Sarić', gender: 'F', address: 'Šabačka 10', phoneNumber: '060123456', email: 'sara@example.com', userType: 'tourist', status: 'active', creditCardNumber: generateLuhnNumber('5', 16)},
    ]);

    // Korisnici na čekanju
    await User.insertMany([
        { username: 'ceka1', password: await bcrypt.hash(generateValidPassword('Ceka'), 10), name: 'Čekalica', surname: 'Prva', gender: 'F', address: 'Na čekanju 1', phoneNumber: '061000001', email: 'ceka1@example.com', userType: 'tourist', status: 'waiting_for_approval', creditCardNumber: generateLuhnNumber('4', 16) },
        { username: 'ceka2', password: await bcrypt.hash(generateValidPassword('Ceka'), 10), name: 'Čekalica', surname: 'Druga', gender: 'M', address: 'Na čekanju 2', phoneNumber: '061000002', email: 'ceka2@example.com', userType: 'owner', status: 'waiting_for_approval', creditCardNumber: generateLuhnNumber('5', 16) },
        { username: 'ceka3', password: await bcrypt.hash(generateValidPassword('Ceka'), 10), name: 'Čekalica', surname: 'Treća', gender: 'F', address: 'Na čekanju 3', phoneNumber: '061000003', email: 'ceka3@example.com', userType: 'tourist', status: 'waiting_for_approval', creditCardNumber: generateLuhnNumber('36', 14) },
      ]);
      
      console.log('Korisnici uspešno dodati.');
      
    // --- Kreiranje Vikendica ---
    const cottages = await Cottage.insertMany([
        { name: 'Planinska idila', location: 'Zlatibor', services: 'WiFi, Parking, TV, Kamin', tariff: { summer: 50, winter: 70 }, phoneNumber: '063333333', coordinates: { lat: 43.72, lon: 19.70 }, pictures: [], ownerId: owners[0]._id, averageRating: 4.8 },
        { name: 'Šumski mir', location: 'Tara', services: 'Sauna, Bazen, WiFi', tariff: { summer: 80, winter: 100 }, phoneNumber: '064444444', coordinates: { lat: 43.90, lon: 19.53 }, pictures: [], ownerId: owners[1]._id, averageRating: 4.5 },
        { name: 'Sunčana dolina', location: 'Kopaonik', services: 'Ski-in/Ski-out, WiFi, Parking', tariff: { summer: 60, winter: 120 }, phoneNumber: '063333333', coordinates: { lat: 43.28, lon: 20.81 }, pictures: [], ownerId: owners[0]._id },
        { name: 'Jeleni Jarak', location: 'Goč', services: 'Dvorište, Roštilj, Mir i tišina', tariff: { summer: 40, winter: 50 }, phoneNumber: '066666666', coordinates: { lat: 43.53, lon: 20.89 }, pictures: [], ownerId: owners[3]._id, averageRating: 3.2 },
        { name: 'Orlovo gnezdo', location: 'Divčibare', services: 'Pogled, Terasa, WiFi', tariff: { summer: 55, winter: 75 }, phoneNumber: '064444444', coordinates: { lat: 44.11, lon: 20.04 }, pictures: [], ownerId: owners[1]._id, averageRating: 2.1 },
        { name: 'Zlatiborski san', location: 'Zlatibor', services: 'Spa, Bazen, Restoran', tariff: { summer: 90, winter: 110 }, phoneNumber: '065555555', coordinates: { lat: 43.73, lon: 19.71 }, pictures: [], ownerId: owners[2]._id },
        { name: 'Tarski konaci', location: 'Tara', services: 'Domaća kuhinja, Mir, Priroda', tariff: { summer: 45, winter: 65 }, phoneNumber: '066666666', coordinates: { lat: 43.91, lon: 19.54 }, pictures: [], ownerId: owners[3]._id, averageRating: 4.9 },
        { name: 'Vila Pahulja', location: 'Kopaonik', services: 'Luksuz, Kamin, Pogled na stazu', tariff: { summer: 150, winter: 250 }, phoneNumber: '063333333', coordinates: { lat: 43.29, lon: 20.82 }, pictures: [], ownerId: owners[0]._id },
        { name: 'Koliba Breza', location: 'Divčibare', services: 'Rustično, Kamin, Tišina', tariff: { summer: 35, winter: 55 }, phoneNumber: '064444444', coordinates: { lat: 44.12, lon: 20.05 }, pictures: [], ownerId: owners[1]._id },
        { name: 'Vidikovac', location: 'Goč', services: 'Neverovatan pogled, Terasa', tariff: { summer: 65, winter: 85 }, phoneNumber: '065555555', coordinates: { lat: 43.54, lon: 20.90 }, pictures: [], ownerId: owners[2]._id },
    ]);
    console.log('Vikendice uspešno dodate.');

    // --- Kreiranje Rezervacija ---
    await Reservation.insertMany([
        // Prošle
        { touristId: tourists[0]._id, cottageId: cottages[0]._id, startDate: new Date('2024-07-10'), endDate: new Date('2024-07-15'), status: 'approved', isReviewed: true },
        { touristId: tourists[1]._id, cottageId: cottages[1]._id, startDate: new Date('2024-08-01'), endDate: new Date('2024-08-08'), status: 'approved', isReviewed: false },
        { touristId: tourists[2]._id, cottageId: cottages[0]._id, startDate: new Date('2024-06-20'), endDate: new Date('2024-06-25'), status: 'denied', denyComment: 'Dupla rezervacija.' },
        // Buduće
        { touristId: tourists[3]._id, cottageId: cottages[2]._id, startDate: new Date('2025-09-05'), endDate: new Date('2025-09-12'), status: 'unresolved' },
        { touristId: tourists[4]._id, cottageId: cottages[3]._id, startDate: new Date('2025-10-10'), endDate: new Date('2025-10-15'), status: 'approved' },
        { touristId: tourists[5]._id, cottageId: cottages[4]._id, startDate: new Date('2025-11-20'), endDate: new Date('2025-11-25'), status: 'approved' },
        { touristId: tourists[0]._id, cottageId: cottages[5]._id, startDate: new Date('2025-09-15'), endDate: new Date('2025-09-20'), status: 'canceled' },
        { touristId: tourists[1]._id, cottageId: cottages[6]._id, startDate: new Date('2025-12-28'), endDate: new Date('2026-01-04'), status: 'unresolved' },
        { touristId: tourists[6]._id, cottageId: cottages[7]._id, startDate: new Date('2026-02-10'), endDate: new Date('2026-02-17'), status: 'approved' },
        { touristId: tourists[8]._id, cottageId: cottages[8]._id, startDate: new Date('2025-08-25'), endDate: new Date('2025-08-30'), status: 'unresolved' },
    ]);
    console.log('Rezervacije uspešno dodate.');
    
    // --- Kreiranje Recenzija ---
    await Review.insertMany([
        { touristId: tourists[0]._id, cottageId: cottages[0]._id, rating: 5, comment: 'Sve je bilo sjajno, preporučujem svima!' },
        { touristId: tourists[2]._id, cottageId: cottages[1]._id, rating: 4, comment: 'Lepo mesto, ali je put do vikendice loš.' },
        { touristId: tourists[4]._id, cottageId: cottages[4]._id, rating: 1, comment: 'Užasno iskustvo, slike ne odgovaraju stvarnosti.' },
        { touristId: tourists[5]._id, cottageId: cottages[4]._id, rating: 1, comment: 'Nikad više. Ne preporučujem.' },
        { touristId: tourists[3]._id, cottageId: cottages[4]._id, rating: 2, comment: 'Nije vredno novca.' },
        { touristId: tourists[6]._id, cottageId: cottages[6]._id, rating: 5, comment: 'Savršeno mesto za odmor!' },
        { touristId: tourists[7]._id, cottageId: cottages[3]._id, rating: 3, comment: 'Prosečno. Ništa specijalno.' },
    ]);
    console.log('Recenzije uspešno dodate.');

    console.log('Baza podataka je uspešno popunjena!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Greška prilikom popunjavanja baze:', error);
    await mongoose.disconnect();
  }
};

seedDatabase();