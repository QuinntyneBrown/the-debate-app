using System;
using System.Collections.Generic;
using TheDebateApp.Data;
using TheDebateApp.Dtos;
using System.Data.Entity;
using System.Linq;
using TheDebateApp.Models;

namespace TheDebateApp.Services
{
    public class InvitationCodeService : IInvitationCodeService
    {
        public InvitationCodeService(IUow uow, ICacheProvider cacheProvider)
        {
            _uow = uow;
            _repository = uow.InvitationCodes;
            _cache = cacheProvider.GetCache();
        }

        public InvitationCodeAddOrUpdateResponseDto AddOrUpdate(InvitationCodeAddOrUpdateRequestDto request)
        {
            var entity = _repository.GetAll()
                .FirstOrDefault(x => x.Id == request.Id && x.IsDeleted == false);
            if (entity == null) _repository.Add(entity = new InvitationCode());
            entity.Code = request.Code;
            _uow.SaveChanges();
            return new InvitationCodeAddOrUpdateResponseDto(entity);
        }

        public dynamic Remove(int id)
        {
            var entity = _repository.GetById(id);
            entity.IsDeleted = true;
            _uow.SaveChanges();
            return id;
        }

        public ICollection<InvitationCodeDto> Get()
        {
            ICollection<InvitationCodeDto> response = new HashSet<InvitationCodeDto>();
            var entities = _repository.GetAll().Where(x => x.IsDeleted == false).ToList();
            foreach(var entity in entities) { response.Add(new InvitationCodeDto(entity)); }    
            return response;
        }


        public InvitationCodeDto GetById(int id)
        {
            return new InvitationCodeDto(_repository.GetAll().Where(x => x.Id == id && x.IsDeleted == false).FirstOrDefault());
        }

        protected readonly IUow _uow;
        protected readonly IRepository<InvitationCode> _repository;
        protected readonly ICache _cache;
    }
}
