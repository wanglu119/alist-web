import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectTrigger,
  SelectValue,
} from "@hope-ui/solid"
import { createSignal, For } from "solid-js"
import { useFetch, useT } from "~/hooks"
import { handleResp, notify, r } from "~/utils"

export const AddSyncCloud = (props: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) => {
  const t = useT()
  const [formData, setFormData] = createSignal({
    name: "",
    cloud_type: "oss",
    access_key: "",
    secret_key: "",
    bucket_name: "",
    endpoint: "",
    region: "",
    prefix: "",
    dst_dir: "",
  })

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const [loading, createSyncCloud] = useFetch(() =>
    r.post("/wl/sync_cloud/create", formData())
  )

  const handleSubmit = async () => {
    const resp = await createSyncCloud()
    handleResp(resp, () => {
      notify.success(t("global.create_success"))
      props.onSuccess?.()
      props.onClose()
    })
  }

  return (
    <Modal
      opened={props.isOpen}
      onClose={props.onClose}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Add Sync Cloud</ModalHeader>
        <ModalBody>
          <VStack spacing="$2">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData().name}
                onInput={(e) => handleChange("name", e.currentTarget.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Cloud Type</FormLabel>
              <Select
                value={formData().cloud_type}
                onChange={(v) => handleChange("cloud_type", v)}
              >
                <SelectTrigger>
                  <SelectPlaceholder>Select option</SelectPlaceholder>
                  <SelectValue />
                  <SelectIcon />
                </SelectTrigger>
                <SelectContent>
                  <SelectListbox>
                    <For each={["oss", "tos"]}>
                      {(item) => (
                        <SelectOption value={item}>
                          <SelectOptionText>{item}</SelectOptionText>
                          <SelectOptionIndicator />
                        </SelectOption>
                      )}
                    </For>
                  </SelectListbox>
                </SelectContent>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Access Key</FormLabel>
              <Input
                value={formData().access_key}
                onInput={(e) => handleChange("access_key", e.currentTarget.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Secret Key</FormLabel>
              <Input
                type="password"
                value={formData().secret_key}
                onInput={(e) => handleChange("secret_key", e.currentTarget.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Bucket Name</FormLabel>
              <Input
                value={formData().bucket_name}
                onInput={(e) => handleChange("bucket_name", e.currentTarget.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Endpoint</FormLabel>
              <Input
                value={formData().endpoint}
                onInput={(e) => handleChange("endpoint", e.currentTarget.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Region</FormLabel>
              <Input
                value={formData().region}
                onInput={(e) => handleChange("region", e.currentTarget.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Prefix</FormLabel>
              <Input
                value={formData().prefix}
                onInput={(e) => handleChange("prefix", e.currentTarget.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Dst Dir</FormLabel>
              <Input
                value={formData().dst_dir}
                onInput={(e) => handleChange("dst_dir", e.currentTarget.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSubmit} loading={loading()}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
