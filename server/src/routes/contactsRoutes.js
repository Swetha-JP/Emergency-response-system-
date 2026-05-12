const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');

router.get('/:userId', contactsController.getContacts);
router.post('/', contactsController.addContact);
router.put('/:contactId', contactsController.updateContact);
router.delete('/:contactId', contactsController.deleteContact);
router.post('/notify', contactsController.notifyContacts);

module.exports = router;
