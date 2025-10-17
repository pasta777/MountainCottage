import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import User from '../models/user.model';
import Cottage from '../models/cottage.model';
import Reservation from '../models/reservation.model';
import Review from '../models/review.model';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = 'mongodb://localhost:27017/mountain_cottage';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding.');

    // Brisanje postojećih podataka
    await User.deleteMany({});
    await Cottage.deleteMany({});
    await Reservation.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data.');

    // Kreiranje administratora
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await User.create({
      username: 'admin',
      password: adminPassword,
      name: 'Admin',
      surname: 'Adminovic',
      gender: 'M',
      address: 'Admin Street 1',
      phoneNumber: '065111222',
      email: 'admin@example.com',
      profilePicture: 'uploads/default.png',
      creditCardNumber: '1234567890123456',
      userType: 'administrator',
      status: 'active',
    });
    console.log('Admin user created.');

    // Kreiranje vlasnika (owners)
    const owners = [];
    for (let i = 0; i < 5; i++) {
      const password = await bcrypt.hash('Owner123!', 10);
      const owner = await User.create({
        username: faker.internet.username(),
        password,
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        gender: faker.person.sex().slice(0, 1).toUpperCase(),
        address: faker.location.streetAddress(),
        phoneNumber: faker.phone.number(),
        email: faker.internet.email(),
        profilePicture: 'uploads/default.png',
        creditCardNumber: faker.finance.creditCardNumber(),
        userType: 'owner',
        status: 'active',
      });
      owners.push(owner);
    }
    console.log('Owner users created.');

    // Kreiranje turista (tourists)
    const tourists = [];
    for (let i = 0; i < 10; i++) {
      const password = await bcrypt.hash('Tourist123!', 10);
      const tourist = await User.create({
        username: faker.internet.username(),
        password,
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        gender: faker.person.sex().slice(0, 1).toUpperCase(),
        address: faker.location.streetAddress(),
        phoneNumber: faker.phone.number(),
        email: faker.internet.email(),
        profilePicture: 'uploads/default.png',
        creditCardNumber: faker.finance.creditCardNumber(),
        userType: 'tourist',
        status: 'active',
      });
      tourists.push(tourist);
    }
    console.log('Tourist users created.');
    
    // Kreiranje vikendica (cottages)
    const cottages = [];
    for (const owner of owners) {
        for (let i = 0; i < 2; i++) {
            const cottage = await Cottage.create({
                name: `${faker.location.city()} Cottage`,
                location: faker.location.city(),
                services: 'Wi-Fi, Parking, Kitchen',
                tariff: {
                    summer: faker.number.int({ min: 50, max: 150 }),
                    winter: faker.number.int({ min: 80, max: 250 }),
                },
                phoneNumber: faker.phone.number(),
                coordinates: {
                    lat: faker.location.latitude(),
                    lon: faker.location.longitude(),
                },
                pictures: [],
                ownerId: owner._id,
            });
            cottages.push(cottage);
        }
    }
    console.log('Cottages created.');

    // Kreiranje rezervacija
     for (const tourist of tourists) {
        for (let i = 0; i < 2; i++) {
            const cottage = faker.helpers.arrayElement(cottages);
            const startDate = faker.date.between({ from: '2025-01-01', to: '2025-12-31' });
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + faker.number.int({ min: 2, max: 10 }));

            await Reservation.create({
                touristId: tourist._id,
                cottageId: cottage._id,
                startDate,
                endDate,
                status: faker.helpers.arrayElement(['approved', 'denied', 'unresolved', 'canceled']),
                isReviewed: false,
            });
        }
    }
    console.log('Reservations created.');


    console.log('Database seeding completed successfully.');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();