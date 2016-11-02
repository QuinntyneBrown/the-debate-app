namespace TheDebateApp.Dtos
{
    public class DigitalAssetDto
    {
        public DigitalAssetDto(TheDebateApp.Models.DigitalAsset entity)
        {
            this.Id = entity.Id;
            this.Name = entity.Name;
        }

        public DigitalAssetDto()
        {
            
        }

        public int Id { get; set; }
        public string Name { get; set; }
    }
}
