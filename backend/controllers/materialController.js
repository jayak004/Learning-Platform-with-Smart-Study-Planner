import Material from '../models/Material.js';

// @desc    Get all materials for a user
// @route   GET /api/materials
// @access  Private
export const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ user: req.user._id });
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get materials for a specific course
// @route   GET /api/materials/course/:courseId
// @access  Private
export const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ course: req.params.courseId, user: req.user._id });
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new material
// @route   POST /api/materials
// @access  Private
export const createMaterial = async (req, res) => {
  try {
    const { title, content, type, courseId } = req.body;

    if (!title || !content || !courseId) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const material = await Material.create({
      title,
      content,
      type: type || 'text',
      course: courseId,
      user: req.user._id,
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle material completion status
// @route   PUT /api/materials/:id/status
// @access  Private
export const toggleMaterialStatus = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check user
    if (material.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    material.isCompleted = req.body.isCompleted !== undefined ? req.body.isCompleted : !material.isCompleted;
    const updatedMaterial = await material.save();

    res.status(200).json(updatedMaterial);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await material.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
