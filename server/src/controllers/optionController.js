import HandlerOption from "../models/HandlerOption.js";

export const listHandlers = async (req, res) => {
  try {
    const list = await HandlerOption.find().sort({ name: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addHandler = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
    const exists = await HandlerOption.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ message: "Handler already exists" });
    const item = await HandlerOption.create({ name: name.trim() });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteHandler = async (req, res) => {
  try {
    const id = req.params.id;
    await HandlerOption.findByIdAndDelete(id);
    res.json({ message: "Handler deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
