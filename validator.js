const { body,validationResult } = require('express-validator');

exports.validateId = (req, res, next) => {
    let id=req.params.id;
    console.log('coming here');
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }
    next();


};

exports.validateSignUp = [body('firstName','First Name is required').notEmpty().trim().escape(),
    body('lastName','Last Name is required').notEmpty().trim().escape(),
    body('email','Email is not valid').isEmail().trim().escape().normalizeEmail(),
    body('password','Password must be atleast 8 characters and at most 64 characters').isLength({min:8,max:64})
];

exports.validateLogin = [body('email','Email is not valid').isEmail().trim().normalizeEmail(),
    body('password','Password must be atleast 8 characters and at most 64 characters').isLength({min:8,max:64})
];

exports.validateResult = (req, res, next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    }
    return next();
}



exports.validateEvent = [
    body('title', 'Title is required').notEmpty().trim().escape(),
    body('category', 'Category is required')
        .notEmpty()
        .isIn(['Sport Events', 'Leisure Events', 'Entertainment', 'Fitness', 'Health', 'Miscellaneous'])
        .withMessage('Category must be one of: Sport Events, Leisure Events, Entertainment, Fitness, Health, Miscellaneous')
        .trim()
        .escape(),
    body('details', 'Details are required').notEmpty().trim().escape(),
    body('location', 'Location is required').notEmpty().trim().escape(),
    body('eventDate', 'Event Date is required')
        .notEmpty()
        .isDate().withMessage('Event Date should be a valid date (YYYY-MM-DD)')
        .isAfter(new Date().toISOString().split('T')[0]).withMessage('Event Date must be in the future')
        .trim()
        .escape(),
    body('startTime', 'Start Time is required')
        .notEmpty()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start Time should be in HH:mm format')
        .trim()
        .escape(),
    body('endTime', 'End Time is required')
        .notEmpty()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End Time should be in HH:mm format')
        .trim()
        .escape(),
    body('endTime').custom((value, { req }) => {
        const startTime = req.body.startTime;
        if (startTime && value) {
            const start = startTime.split(':').map(Number);
            const end = value.split(':').map(Number);
            if (end[0] < start[0] || (end[0] === start[0] && end[1] <= start[1])) {
                throw new Error('End Time must be after Start Time');
            }
        }
        return true;
    })
];

exports.validateRSVP = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .trim()
        .escape()
        .isIn(['YES', 'NO', 'MAYBE'])
        .withMessage('Status must be one of: YES, NO, MAYBE'),
];