import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { UserRole } from '@edusuite/shared-types'

@Injectable()
export class SchoolGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) throw new ForbiddenException('Authentication required')

    // Super admin bypasses school isolation
    if (user.role === UserRole.SUPER_ADMIN) return true

    // Attach schoolId to request params for downstream use
    const paramSchoolId = request.params.schoolId || request.query.schoolId
    if (paramSchoolId && paramSchoolId !== user.schoolId?.toString()) {
      throw new ForbiddenException('Access denied to this school')
    }

    return true
  }
}
