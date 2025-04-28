const faq = require('../models/faqModels')

exports.createFaq = async (req, res) => {
    try {
        let { question, answer } = req.body

        let checkQuestionIsExist = await faq.findOne({ question })

        if (checkQuestionIsExist) {
            return res.status(409).json({ status: 409, success: false, message: "Question Is Already Exist..." })
        }

        checkQuestionIsExist = await faq.create({
            question,
            answer
        });

        return res.status(201).json({ status: 201, success: true, message: "Faq Create SuccessFully...", data: checkQuestionIsExist })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getAllFaqs = async (req, res) => {
    try {
        let page = parseInt(req.query.page)
        let pageSize = parseInt(req.query.pageSize)

        if (page < 1 || pageSize < 1) {
            return res.status(401).json({ status: 401, success: false, message: "Page And PageSize Cann't Be Less Than 1" })
        }

        let paginatedFaqs

        paginatedFaqs = await faq.find()

        let count = paginatedFaqs.length

        if (count === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Faqs Not Found" })
        }

        if (page && pageSize) {
            let startIndex = (page - 1) * pageSize
            let lastIndex = (startIndex + pageSize)
            paginatedFaqs = await paginatedFaqs.slice(startIndex, lastIndex)
        }

        return res.status(200).json({ status: 200, success: true, totalFaqs: count, message: "All Faqs Found SuccessFully...", data: paginatedFaqs })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.getFaqById = async (req, res) => {
    try {
        let id = req.params.id

        let getFaqId = await faq.findById(id)

        if (!getFaqId) {
            return res.status(404).json({ status: 404, success: false, message: "Faq Not Found" })
        }

        return res.status(200).json({ status: 200, success: true, message: "Faq Found SuccessFully...", data: getFaqId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.updateFaqById = async (req, res) => {
    try {
        let id = req.params.id

        let updateFaqId = await faq.findById(id)

        if (!updateFaqId) {
            return res.status(404).json({ status: 404, success: false, message: "Faq Not Found" })
        }

        updateFaqId = await faq.findByIdAndUpdate(id, { ...req.body }, { new: true })

        return res.status(200).json({ status: 200, success: true, message: "faq Updated SuccessFully...", data: updateFaqId })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}

exports.deleteFaqById = async (req, res) => {
    try {
        let id = req.params.id

        let deleteFaqId = await faq.findById(id)

        if (!deleteFaqId) {
            return res.status(404).json({ status: 404, success: false, message: "Faq Not Found" })
        }

        await faq.findByIdAndDelete(id)

        return res.status(200).json({ status: 200, success: true, message: "Faq Deleted SuccessFully..." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, success: false, message: error.message })
    }
}