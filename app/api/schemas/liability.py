from common.base_entities import *

class LiabilitySchemaIn(Liability):
    pass



class LiabilitySchemaOut(Liability):
    id: int 
    created_at: Optional[datetime] = None