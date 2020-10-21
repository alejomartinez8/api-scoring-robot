const db = require('../../helpers/db');

module.exports = {
  addEvent,
  updateEvent,
  getAllEvents,
  getById,
  getBySlug,
  deleteEvent,
  toggleActiveEvent
};

/** Add an Event */
async function addEvent(params) {
  // validate
  if (await db.Event.findOne({ name: params.name })) {
    throw `Evento "${params.name}" ya está registrado`;
  }

  if (await db.Event.findOne({ slug: params.slug })) {
    throw `Nombre corto de evento "${params.slug}" ya está registrado`;
  }

  const event = new db.Event(params);
  await event.save().then((event) => event.populate('challenges').execPopulate());

  return event;
}

/** Update an Event */
async function updateEvent(id, params) {
  if (!db.isValidId(id)) throw 'Id de evento no válido';
  const event = await db.Event.findById(id);
  if (!event) throw 'Evento no encontrado';

  if (event.name !== params.name && (await db.Event.findOne({ name: params.name }))) {
    throw `Evento "${params.name}" ya existe`;
  } else if (event.slug !== params.slug && (await db.Event.findOne({ slug: params.slug }))) {
    throw `Nombre corto evento "${params.name}" ya existe`;
  }

  Object.assign(event, params);
  event.updated = Date.now();
  await event.save().then((event) => event.populate('challenges').execPopulate());

  return event;
}

/** Get Event by Id */
async function getById(id) {
  if (!db.isValidId(id)) throw 'Id de evento no válido';
  const event = await db.Event.findById(id).populate('challenges', ['name', 'imageURL', 'available']);
  if (!event) throw 'Evento no encontrado';
  return event;
}

/** Get Event by slug */
async function getBySlug(slug) {
  const event = await db.Event.findOne({ slug: slug })
    .collation({
      // case-insensitive
      locale: 'en',
      strength: 2
    })
    .populate('challenges');

  if (!event) throw 'Evento no encontrado';
  return event;
}

/** Get All Events */
async function getAllEvents() {
  const events = await db.Event.find().populate('challenges');
  return events.map((event) => event);
}

/**Delete Event by Id */
async function deleteEvent(id) {
  if (!db.isValidId(id)) {
    throw 'Id de evento no válido';
  }

  const teams = await db.Team.find({ event: id });
  if (teams.length > 0) {
    return { type: 'reference', message: 'No es posible realizar esta operación, hay que equipos asociados a este evento' };
  } else {
    const event = await db.Event.findOneAndDelete({ _id: id });
    if (!event) throw 'Evento no encontrado';
    return { type: 'delete-success', message: 'Evento Eliminado Exitosamente', event: event };
  }
}

/** Active Event */
async function toggleActiveEvent(id) {
  if (!db.isValidId(id)) {
    throw 'Id Evento no válido';
  }

  const event = await db.Event.findById(id);
  if (!event) {
    throw 'Evento no encontrado';
  }

  event.active = !event.active;
  event.updated = Date.now();
  event.save();
  return event;
}
