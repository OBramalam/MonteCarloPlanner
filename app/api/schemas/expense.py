from common.base_entities import *

class ExpenseSchemaIn(Expense):
    pass


class ExpenseSchemaOut(Expense):
    id: int
    created_at: Optional[datetime] = None