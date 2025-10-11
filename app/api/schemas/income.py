from common.base_entities import *

class IncomeSchemaIn(Income):
    pass


class IncomeSchemaOut(Income):
    id: int
    created_at: Optional[datetime] = None
