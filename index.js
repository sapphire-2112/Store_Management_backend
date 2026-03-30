require("dotenv").config()
const cors = require("cors");
const express = require("express")
const mongoose = require("mongoose")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err))


const productSchema = new mongoose.Schema({

    productName:{
        type:String,
        required:true
    },

    productCode:{
        type:String,
        required:true,
        unique:true
    },

    category:{
        type:String
    },

    supplierName:{
        type:String,
        required:true
    },

    quantityInStock:{
        type:Number,
        min:0
    },

    reorderLevel:{
        type:Number,
        min:1
    },

    unitPrice:{
        type:Number,
        min:1
    },

    manufactureDate:{
        type:Date
    },

    productType:{
        type:String,
        enum:["Perishable","Non-Perishable"]
    },

    status:{
        type:String,
        enum:["Available","Out of Stock"],
        default:"Available"
    }

})

const Product = mongoose.model("Product",productSchema)


app.post("/products", async(req,res)=>{

    try{

        const product = new Product(req.body)

        await product.save()

        res.status(201).json(product)

    }
    catch(err){

        res.status(400).json({error:err.message})

    }

})

app.get("/products", async(req,res)=>{

    try{

        const products = await Product.find()

        res.status(200).json(products)

    }
    catch(err){

        res.status(500).json({error:err.message})

    }

})


app.get("/products/:id", async(req,res)=>{

    try{

        const product = await Product.findById(req.params.id)

        if(!product){
            return res.status(404).json({message:"Product not found"})
        }

        res.status(200).json(product)

    }
    catch(err){

        res.status(500).json({error:err.message})

    }

})


app.put("/products/:id", async(req,res)=>{

    try{

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )

        if(!product){
            return res.status(404).json({message:"Product not found"})
        }

        res.status(200).json(product)

    }
    catch(err){

        res.status(400).json({error:err.message})

    }

})


app.delete("/products/:id", async(req,res)=>{

    try{

        const product = await Product.findByIdAndDelete(req.params.id)

        if(!product){
            return res.status(404).json({message:"Product not found"})
        }

        res.status(200).json({message:"Product deleted"})

    }
    catch(err){

        res.status(500).json({error:err.message})

    }

})


app.get("/products/search", async(req,res)=>{

    try{

        const name = req.query.name

        const products = await Product.find({
            productName: {$regex:name,$options:"i"}
        })

        res.status(200).json(products)

    }
    catch(err){

        res.status(500).json({error:err.message})

    }

})


app.get("/products/category", async(req,res)=>{

    try{

        const cat = req.query.cat

        const products = await Product.find({
            category:cat
        })

        res.status(200).json(products)

    }
    catch(err){

        res.status(500).json({error:err.message})

    }

})


const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})