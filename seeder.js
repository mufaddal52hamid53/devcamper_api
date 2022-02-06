const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGO_URI, {});

const bootcamps = JSON.parse(fs.readFileSync('./_data/bootcamps.json', 'utf-8'));
const courses = JSON.parse(fs.readFileSync('./_data/courses.json', 'utf-8'));

// Insert Data
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    console.log('Data Imported'.green.inverse);
    process.exit();
  } catch (e) {
    console.log(e);
  }
};

// Delete data
const deleteData = async (shouldExit = true) => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log('Data Destroyed'.red.inverse);
    if (shouldExit) process.exit();
    return;
  } catch (e) {
    console.log(e);
  }
};

if (process.argv[2] == '-i') {
  importData();
} else if (process.argv[2] == '-d') {
  deleteData();
} else if (process.argv[2] == '-a') {
  deleteData(false).then(() => importData());
} else {
  process.exit();
}
