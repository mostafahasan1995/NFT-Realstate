import { Asset } from "../../schemas/asset.schema"
import { ActionInterface } from "./action.interface"

export interface TimelineInterface {

  asset: Asset | string
  actions: ActionInterface[]
  createdAt?: Date
  updatedAt?: Date
}
