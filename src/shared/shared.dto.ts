export class SuccessResponseDTO {
  statusCode: string

  constructor(partial: Partial<SuccessResponseDTO>) {
    Object.assign(this, partial)
  }
}
