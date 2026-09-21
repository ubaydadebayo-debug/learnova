import { Router } from 'express';
import { getCourses, getCourse } from '../controllers/course.controller.js';
import { listCoursesValidation, courseIdentifierValidation } from '../validators/course.validator.js';

const router = Router();

router.get('/', listCoursesValidation, getCourses);
router.get('/:id', courseIdentifierValidation, getCourse);

export default router;