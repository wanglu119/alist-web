import {
  Badge,
  Box,
  Button,
  Grid,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from "@hope-ui/solid"
import { createEffect, createSignal, For, Show } from "solid-js"
import { useFetch, useT } from "~/hooks"
import { getMainColor } from "~/store"
import { handleResp, r, formatDate, getFileSize, notify } from "~/utils"
import { DeletePopover } from "../common/DeletePopover"

interface SyncCloudTask {
  name: string
  cloud_type: string
  proc_file_count: number
  proc_info: {
    id: string
    status: string
    start_time: string
    end_time?: string
    total_bytes: number
    error?: string
  }
}

interface SyncCloudListResp {
  tasks: SyncCloudTask[]
}

const SyncCloudCard = (props: { task: SyncCloudTask; refresh: () => void }) => {
  const t = useT()
  const c = useColorModeValue("$neutral2", "$neutral3")
  const [deleteLoading, deleteSyncCloud] = useFetch(() =>
    r.post("/wl/sync_cloud/delete", { id: props.task.proc_info.id })
  )
  const [startLoading, startSyncCloud] = useFetch(() =>
    r.post("/wl/sync_cloud/start", { id: props.task.proc_info.id })
  )
  const [stopLoading, stopSyncCloud] = useFetch(() =>
    r.post("/wl/sync_cloud/stop", { id: props.task.proc_info.id })
  )

  const handleDelete = async () => {
    const resp = await deleteSyncCloud()
    handleResp(resp, () => {
      notify.success(t("global.delete_success"))
      props.refresh()
    })
  }

  const handleStart = async () => {
    const resp = await startSyncCloud()
    handleResp(resp, () => {
      notify.success(t("global.start_success"))
      props.refresh()
    })
  }

  const handleStop = async () => {
    const resp = await stopSyncCloud()
    handleResp(resp, () => {
      notify.success(t("global.stop_success"))
      props.refresh()
    })
  }
  
  return (
    <VStack
      w="$full"
      spacing="$2"
      rounded="$lg"
      border="1px solid $neutral7"
      background={c()}
      p="$3"
      alignItems="start"
      _hover={{
        border: `1px solid ${getMainColor()}`,
      }}
    >
      <HStack spacing="$2" w="$full" justifyContent="space-between">
        <HStack spacing="$2">
          <Text fontWeight="$medium" fontSize="$lg">
            {props.task.name}
          </Text>
          <Badge colorScheme="info">{props.task.cloud_type}</Badge>
        </HStack>
        <Badge
          colorScheme={
            props.task.proc_info.status === "finish" 
            ? "success" 
            : props.task.proc_info.status === "error" 
            ? "danger" 
            : "warning"
          }
        >
          {props.task.proc_info.status}
        </Badge>
      </HStack>

      <Grid templateColumns="repeat(2, 1fr)" gap="$2" w="$full" fontSize="$sm" color="$neutral10">
        <Box>
          <Text color="$neutral9">Total Size</Text>
          <Text>{getFileSize(props.task.proc_info.total_bytes)}</Text>
        </Box>
        <Box>
          <Text color="$neutral9">Files</Text>
          <Text>{props.task.proc_file_count}</Text>
        </Box>
        <Box>
           <Text color="$neutral9">Start Time</Text>
           <Text>{formatDate(props.task.proc_info.start_time)}</Text>
        </Box>
        <Show when={props.task.proc_info.end_time}>
          <Box>
             <Text color="$neutral9">End Time</Text>
             <Text>{formatDate(props.task.proc_info.end_time!)}</Text>
          </Box>
        </Show>
      </Grid>
      
      <Show when={props.task.proc_info.error}>
        <Text color="$danger9" fontSize="$xs">
          {props.task.proc_info.error}
        </Text>
      </Show>

      <HStack w="$full" justifyContent="flex-end" spacing="$2">
        <Button onClick={handleStart} loading={startLoading()} size="sm">
          {t("global.enable")}
        </Button>
        <Button
          onClick={handleStop}
          loading={stopLoading()}
          colorScheme="warning"
          size="sm"
        >
          {t("global.disable")}
        </Button>
        <DeletePopover
          name={props.task.name}
          loading={deleteLoading()}
          onClick={handleDelete}
        />
      </HStack>
    </VStack>
  )
}

export const SyncCloudList = (props: { refreshTrigger: number }) => {
  const [tasks, setTasks] = createSignal<SyncCloudTask[]>([])
  const [loading, loadTasks] = useFetch(() => r.get("/wl/sync_cloud/list"))

  const refresh = async () => {
    const resp = await loadTasks()
    handleResp(resp, (data: SyncCloudListResp) => {
      setTasks(data.tasks || [])
    })
  }

  createEffect(() => {
    // depend on trigger
    props.refreshTrigger
    refresh()
  })

  // Initial load
  refresh()

  return (
    <Box w="$full" mt="$4">
      <Show when={tasks().length > 0}>
        <Text fontSize="$xl" fontWeight="$bold" mb="$2">
          Sync Cloud Tasks
        </Text>
        <Grid
          gap="$3"
          templateColumns={{
            "@initial": "1fr",
            "@md": "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          <For each={tasks()}>{(task) => <SyncCloudCard task={task} refresh={refresh} />}</For>
        </Grid>
      </Show>
    </Box>
  )
}
