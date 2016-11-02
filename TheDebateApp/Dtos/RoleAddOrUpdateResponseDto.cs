namespace TheDebateApp.Dtos
{
    public class RoleAddOrUpdateResponseDto: RoleDto
    {
        public RoleAddOrUpdateResponseDto(TheDebateApp.Models.Role entity)
            :base(entity)
        {

        }
    }
}
