import { Router } from 'express';
import {
  getKnowledgeBaseTree,
  getPublishedKnowledgeBaseArticle,
  searchKnowledgeBase,
} from '../controllers/knowledgeBase.controller';
import { UserRole } from '../config/constants';
import { authorize, protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import {
  publicArticleSlugValidator,
  searchKnowledgeBaseValidator,
} from '../validators/knowledgeBase.validator';

const router = Router();

router.use(protect);
router.use(authorize([UserRole.ARTIST, UserRole.LABEL, UserRole.ADMIN, UserRole.SUBADMIN]));

router.get('/categories', getKnowledgeBaseTree);
router.get('/search', validate(searchKnowledgeBaseValidator), searchKnowledgeBase);
router.get('/articles/:slug', validate(publicArticleSlugValidator), getPublishedKnowledgeBaseArticle);

export default router;
