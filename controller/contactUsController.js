const contactUs = require('../models/contacUsModels')

exports.createContactUs = async (req, res) => {
    try {
        let { name, email, phoneNo, subject, message } = req.body

        let createContactUs = await contactUs.create({
            name,
            email,
            phoneNo,
            subject,
            message
        })

        return res.status(200).json({ status: 200, success: true, message: "conactUs Create SuccessFully...", data: createContactUs })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllContactUs = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedContactUs;

        paginatedContactUs = await contactUs.find()

        let count = paginatedContactUs.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "contactUs Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedContactUs = await paginatedContactUs.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalContactUs: count, message: "All ContactUs Found SuccessFully...", data: paginatedContactUs })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getContactUsById = async (req, res) => {
    try {
        let id = req.params.id

        let getContactId = await contactUs.findById(id)

        if (!getContactId) {
            return res.status(404).json({ status: 404, success: false, message: "contactUs Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "ContactUs Found SuccessFully...", data: getContactId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteContactUsById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteContactUsId = await contactUs.findById(id)

        if (!deleteContactUsId) {
            return res.status(404).json({ status: 404, success: false, message: "ContactUs Not Found" })
        }

        await contactUs.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: 'contactUs Delete successFully...' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}