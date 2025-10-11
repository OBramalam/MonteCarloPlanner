from common.base_entities import *

class FinancialEventSchemaIn(FinancialEvent):
    pass



class FinancialEventSchemaOut(FinancialEvent):
    id: int
    created_at: Optional[datetime] = None