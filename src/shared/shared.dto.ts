export class SuccessResponseDTO {
  statusCode: string
  // data: any

  constructor(partial: Partial<SuccessResponseDTO>) {
    Object.assign(this, partial)
  }
}
