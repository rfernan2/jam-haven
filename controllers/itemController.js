const Item = require("../models/items");
const path = require("path");

// Get All Items 
exports.index = (req, res, next) => {
    let searchQuery = req.query.search;
    let queryFilter = {};


    if (searchQuery) {
        searchQuery = searchQuery.toLowerCase();
        queryFilter.$or = [
            { title: { $regex: searchQuery, $options: "i" } },
            { details: { $regex: searchQuery, $options: "i" } }
        ];
    }

    Item.find(queryFilter).populate('user')
        .sort({ price: 1 })
        .then(items => {
            if (searchQuery && !items.length) {
                let err = new Error(`No results found for "${req.query.search}".`);
                err.status = 404;
                return next(err);
            }
            res.render("items", { items, searchQuery });
        })
        .catch(err => next(err));
};

// Get Single Item By ID
exports.getItemById = (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error("Invalid item ID format.");
        err.status = 400;
        return next(err);
    }

    Item.findById(id).populate('user')
        .then(item => {
            if (!item) {
                let err = new Error("Item not found.");
                err.status = 404;
                return next(err);
            }
            res.render("item", { item, currentUser: req.session.user });

        })
        .catch(err => next(err));
};

// Get Form to Create New Item
exports.getNewItemForm = (req, res) => {
    res.render("new");
};

// Create New Item
exports.createNewItem = (req, res, next) => {
    let imagePath = "/uploads/default.jpg";
    let { title, condition, price, details, offers } = req.body;
    const user = req.session.user; 

    if (!title || !condition || !price || !details) {
        return res.status(400).render("error", { error: new Error("All fields are required.") });
    }

    if (price < 0 || (offers && offers < 0)) {
        return res.status(400).render("error", { error: new Error("Price and offers must be non-negative.") });
    }

    if (details.length < 10) {
        return res.status(400).render("error", { error: new Error("Details must be at least 10 characters.") });
    }

    offers = parseInt(offers) || 0;

    if (req.files && req.files.image) {
        let image = req.files.image;
        let allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).render("error", { message: "Invalid image format." });
        }

        imagePath = `/uploads/${Date.now()}-${image.name}`;
        const savePath = path.join(__dirname, "..", "public", imagePath);
        image.mv(savePath)
            .then(() => saveItem())
            .catch(() => res.status(500).render("error", { message: "Could not save image." }));
    } else {
        saveItem();
    }

    function saveItem() {
        new Item({
            title,
            user,
            condition,
            price: parseFloat(price),
            details,
            offers,
            image: imagePath,
            active: true
        })
        .save()
        .then(() => res.redirect("/items"))
        .catch(err => {
            if (err.name === 'ValidationError') {
              req.flash('error', err.message);
              return res.redirect('back');
            }
            next(err);
          });
    }
};

// Get Form to Edit Item
exports.getEditItemForm = (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error("Invalid item ID format.");
        err.status = 400;
        return next(err);
    }

    Item.findById(id)
        .then(item => {
            if (!item) {
                let err = new Error("Item not found.");
                err.status = 404;
                return next(err);
            }
            res.render("edit", { item });
        })
        .catch(err => next(err));
};

// Update Item
exports.updateItem = (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error("Invalid item ID format.");
        err.status = 400;
        return next(err);
    }

    Item.findById(id)
        .then(item => {
            if (!item) {
                let err = new Error("Item not found.");
                err.status = 404;
                return next(err);
            }

            if (req.files && req.files.image) {
                let image = req.files.image;
                let allowedTypes = ["image/jpeg", "image/png", "image/gif"];
                if (!allowedTypes.includes(image.mimetype)) {
                    let err = new Error("Invalid image format.");
                    err.status = 400;
                    return next(err);
                }

                let imagePath = `/uploads/${Date.now()}-${image.name}`;
                return image.mv(`./public${imagePath}`)
                    .then(() => {
                        item.image = imagePath;
                        updateFields(item, req.body);
                        return item.save();
                    });
            }

            updateFields(item, req.body);
            return item.save();
        })
        .then(() => res.redirect("/items"))
        .catch(err => {
            if (err.name === 'ValidationError') {
              req.flash('error', err.message);
              return res.redirect('back');
            }
            next(err);
        });
};

function updateFields(item, body) {
    item.title = body.title;
    item.condition = body.condition;
    item.price = parseFloat(body.price);
    item.details = body.details;
    item.offers = parseInt(body.offers) || 0;
}

// Delete Item
exports.deleteItem = (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error("Invalid item ID format.");
        err.status = 400;
        return next(err);
    }

    Item.findByIdAndDelete(id)
        .then(item => {
            if (!item) {
                let err = new Error("Item not found.");
                err.status = 404;
                return next(err);
            }
            res.redirect("/items");
        })
        .catch(err => next(err));
};
