const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');


const Schema = mongoose.Schema;

const Slider = new Schema({
  name: {type:String, required:true},
  title:{type:String},
  image: {type:String},
  address:{String},
  slug: { type: String},
  note:{type:String},
}, {
  timestamps: true,
});


//add plugin
mongoose.plugin(slug);
Slider.plugin(mongooseDelete,  {
  deletedAt: true,
   overrideMethods: 'all' ,
  });

module.exports = mongoose.model('Slider', Slider);