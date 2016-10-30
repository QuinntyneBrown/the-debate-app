namespace TheDebateApp.Dtos
{
    public class UserAddOrUpdateResponseDto: UserDto
    {
        public UserAddOrUpdateResponseDto(Models.User entity)
        :base(entity)
        {

        }
    }
}
