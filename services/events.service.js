const db = require('helpers/db');
const userService = require('./user.service');

module.exports = {
  addEvent,
  updateEvent,
  getAllEvents,
  getById,
  deleteEvent
};

/** Get All Events */
async function getAllEvents() {
  const events = await db.Event.find();
  return events.map((event) => basicDetails(event));
}

/** Add an Event */
async function addEvent(params) {
  // validate
  if (await db.Event.findOne({ name: params.name })) {
    throw `Evento "${params.name}" ya está registrado`;
  }

  if (await db.Event.findOne({ shortName: params.shortName })) {
    throw `Nombre corto de evento "${params.shortName}" ya está registrado`;
  }

  const event = new db.Event(params);
  await event.save();
  return basicDetails(event);
}

/** Update an Event */
async function updateEvent(id, params) {
  if (!db.isValidId(id)) throw 'Id de evento no válido';
  const event = await db.Event.findById(id);
  if (!event) throw 'Evento no encontrado';

  if (event.name !== params.name && (await db.User.findOne({ name: params.name }))) {
    throw `Evento "${params.name}" ya existe`;
  } else if (
    event.shortName !== params.shortName &&
    (await db.User.findOne({ shortName: params.shortName }))
  ) {
    throw `Nombre corto evento "${params.name}" ya existe`;
  }

  Object.assign(event, params);
  event.updated = Date.now();
  await event.save();

  return basicDetails(event);
}

/** Get Event by Id */
async function getById(id) {
  if (!db.isValidId(id)) throw 'Id de evento no válido';
  const event = await db.Event.findById(id);
  if (!event) throw 'Evento no encontrado';
  return basicDetails(event);
}

/**Delete Event by Id */
async function deleteEvent(id) {
  if (!db.isValidId(id)) throw 'Id de evento no válido';
  const event = await db.Event.findById(id);
  if (!event) throw 'Evento no encontrado';
  await event.remove();
}

/**
 * Return Basic Details of User (filter by BD)
 */
function basicDetails(event) {
  //values
  const { id, name, shortName, imageURL, year, description, challenges, created, updated } = event;

  // return
  return {
    id,
    name,
    shortName,
    imageURL,
    year,
    description,
    challenges,
    created,
    updated
  };
}
