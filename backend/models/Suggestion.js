const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SuggestionSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    hostel: {
        type: Schema.Types.ObjectId,
        ref: 'Hostel'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Suggestion', SuggestionSchema);   