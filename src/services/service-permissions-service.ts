import { getServiceByServiceId } from "../datastores/services-data-store.js";
import { getServicesWithRelationForUser } from "../datastores/user-permissions-data-store.js";
import { UserPermission } from "../models/permissions.js";
import { Service } from "../models/service.js";

export const getServicesUserCanView = async (
  userId: string
): Promise<Service[]> => {
  const servicesUserCanView: Service[] = [];

  const serviceIds = await getServicesWithRelationForUser(
    userId,
    UserPermission.READER
  );

  for (const serviceId of serviceIds) {
    const service = await getServiceByServiceId(serviceId);
    if (service) {
      servicesUserCanView.push(service);
    }
  }
  return servicesUserCanView;
};

export const getServicesUserCanEdit = async (
  userId: string
): Promise<Service[]> => {
  const servicesUserCanEdit: Service[] = [];

  const serviceIdsInt = await getServicesWithRelationForUser(
    userId,
    UserPermission.WRITER_INT
  );
  const serviceIdsProd = await getServicesWithRelationForUser(
    userId,
    UserPermission.WRITER_PROD
  );

  const serviceIds: string[] = serviceIdsInt.concat(serviceIdsProd);

  for (const serviceId of serviceIds) {
    const service = await getServiceByServiceId(serviceId);
    if (service) {
      servicesUserCanEdit.push(service);
    }
  }
  return servicesUserCanEdit;
};
